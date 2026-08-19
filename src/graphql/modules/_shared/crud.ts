// Fabryka resolwerów CRUD wymuszająca w jednym miejscu izolację danych firm i własność rekordów

import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import type { GqlContext } from "../../../types/context.js";
import type { TokenPayload } from "../../../utils/jwt.js";
import { User } from "../../../models/users.js";
import { sanitizeMongo } from "../../../utils/validate.js";

export function requireAuth(user: GqlContext["user"]): TokenPayload {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return user;
}

export function requireRole(user: GqlContext["user"], ...roles: string[]): TokenPayload {
  const caller = requireAuth(user);
  if (!roles.includes(caller.role)) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  return caller;
}

export function defined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function toGraphValue(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString();
  if (v instanceof mongoose.Types.Decimal128) return parseFloat(v.toString());
  if (Array.isArray(v)) return v.map(toGraphValue);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = toGraphValue(val);
    return out;
  }
  return v;
}

export function toNumber(v: unknown): number | null {
  if (v == null) return null;
  if (v instanceof mongoose.Types.Decimal128) return parseFloat(v.toString());
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function serializeDoc(doc: any): Record<string, unknown> {
  const obj = doc && typeof doc.toObject === "function" ? doc.toObject({ virtuals: true }) : doc;
  return toGraphValue(obj) as Record<string, unknown>;
}

export function attachActor(doc: any, caller: TokenPayload): void {
  doc.$locals = {
    ...(doc.$locals ?? {}),
    actor: { _id: caller.sub, shortId: caller.shortId, role: caller.role },
  };
}

export async function saveValidated(doc: any): Promise<void> {
  try {
    await doc.save();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join("; ");
      throw new GraphQLError(message || "Invalid input.", { extensions: { code: "BAD_USER_INPUT" } });
    }
    if ((err as { code?: number }).code === 11000) {
      const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue ?? {};
      const field = Object.keys(keyValue)[0] ?? "value";
      throw new GraphQLError(`${field} already exists.`, { extensions: { code: "CONFLICT" } });
    }
    throw err;
  }
}

async function assertOwnerInCompany(
  ownerField: string | undefined,
  fields: Record<string, unknown>,
  companyId: string | null | undefined,
): Promise<void> {
  if (!ownerField) return;
  const ownerId = fields[ownerField];
  if (!ownerId) return;
  const owner = await User.findById(ownerId as string).select("companyId").lean();
  if (!owner || (owner as { companyId?: string | null }).companyId !== companyId) {
    throw new GraphQLError(`Invalid ${ownerField}: user not found in this company.`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}

async function assertRefsInCompany(
  refs: { field: string; model: any }[] | undefined,
  fields: Record<string, unknown>,
  companyId: string | null | undefined,
  isSystemAdmin: boolean,
): Promise<void> {
  if (!refs?.length || isSystemAdmin) return;
  for (const { field, model } of refs) {
    const id = fields[field];
    if (!id) continue;
    const doc = await model.findById(id as string).select("companyId").lean();
    if (!doc || (doc as { companyId?: string | null }).companyId !== companyId) {
      throw new GraphQLError(`Invalid ${field}: record not found in this company.`, {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
  }
}

const AGENT_ROLES = ["AGENT", "AGENT_ASSISTANT"];
const DEFAULT_DELETE_ROLES = ["SYSTEM_ADMIN", "COMPANY_ADMIN", "MANAGER"];

export const UNASSIGNED_ASSISTANT_SCOPE = "__unassigned_assistant__";

export function agentScopeId(caller: TokenPayload): string {
  if (caller.role !== "AGENT_ASSISTANT") return caller.sub;
  return caller.assignedAgentId || UNASSIGNED_ASSISTANT_SCOPE;
}

export function isUnassignedAssistant(caller: TokenPayload): boolean {
  return caller.role === "AGENT_ASSISTANT" && !caller.assignedAgentId;
}

const DEFAULT_LIST_LIMIT = 200;
const MAX_LIST_LIMIT = 500;

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface CrudConfig {
  model: any;
  names: { list: string; byId?: string; create: string; update: string; remove: string };
  ownerField?: string;
  relatedRefs?: { field: string; model: any }[];
  defaultSort?: Record<string, 1 | -1>;
  deleteRoles?: string[];
  immutable?: boolean;
  searchFields?: string[];
  prepareCreate?: (fields: Record<string, unknown>, caller: TokenPayload) => Record<string, unknown>;
  prepareUpdate?: (fields: Record<string, unknown>, caller: TokenPayload, doc: any) => Record<string, unknown>;
}

export function makeCrudResolvers(cfg: CrudConfig) {
  const {
    model,
    names,
    ownerField,
    defaultSort = { createdAt: -1 },
    deleteRoles = DEFAULT_DELETE_ROLES,
    searchFields,
  } = cfg;

  const isAgentScoped = (caller: TokenPayload) => ownerField && AGENT_ROLES.includes(caller.role);

  function scopeFilter(caller: TokenPayload, companyIdArg?: string): Record<string, unknown> {
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (caller.role === "SYSTEM_ADMIN") {
      if (companyIdArg) filter.companyId = sanitizeMongo(companyIdArg);
    } else {
      filter.companyId = caller.companyId;
      if (isAgentScoped(caller)) filter[ownerField!] = agentScopeId(caller);
    }
    return filter;
  }

  function assertCanAccess(caller: TokenPayload, doc: any): void {
    if (caller.role === "SYSTEM_ADMIN") return;
    if (caller.companyId !== doc.companyId) {
      throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
    }
    if (!isAgentScoped(caller)) return;
    if (isUnassignedAssistant(caller)) {
      throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
    }
    if (doc[ownerField!] !== agentScopeId(caller)) {
      throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
    }
  }

  const queryResolvers: Record<string, unknown> = {
    [names.list]: async (
      _: unknown,
      args: { companyId?: string; limit?: number; offset?: number; search?: string },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const take = Math.min(Math.max(Number(args.limit) || DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT);
      const skip = Math.max(Number(args.offset) || 0, 0);
      const filter = scopeFilter(caller, args.companyId);

      const term = typeof args.search === "string" ? args.search.trim().slice(0, 120) : "";
      if (term && searchFields?.length) {
        const rx = new RegExp(escapeRegex(term), "i");
        filter.$or = searchFields.map((f) => ({ [f]: rx }));
      }

      const [docs, totalCount] = await Promise.all([
        model.find(filter).sort(defaultSort).skip(skip).limit(take),
        model.countDocuments(filter),
      ]);
      return {
        items: docs.map(serializeDoc),
        totalCount,
        hasMore: skip + docs.length < totalCount,
      };
    },
  };
  if (names.byId) {
    queryResolvers[names.byId] = async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
      const caller = requireAuth(user);
      const doc = await model.findById(id);
      if (!doc || doc.isDeleted) return null;
      assertCanAccess(caller, doc);
      return serializeDoc(doc);
    };
  }

  return {
    Query: queryResolvers,
    Mutation: {
      [names.create]: async (_: unknown, fields: Record<string, unknown>, { user }: GqlContext) => {
        const caller = requireAuth(user);
        if (!caller.companyId && caller.role !== "SYSTEM_ADMIN") {
          throw new GraphQLError("No company associated", { extensions: { code: "FORBIDDEN" } });
        }
        if (ownerField && isUnassignedAssistant(caller)) {
          throw new GraphQLError("No agent assigned to this assistant account", {
            extensions: { code: "FORBIDDEN" },
          });
        }
        const prepared = cfg.prepareCreate ? cfg.prepareCreate(defined(fields), caller) : defined(fields);
        await assertOwnerInCompany(ownerField, prepared, caller.companyId);
        await assertRefsInCompany(cfg.relatedRefs, prepared, caller.companyId, caller.role === "SYSTEM_ADMIN");
        const doc = new model({ ...prepared, companyId: caller.companyId });
        if (ownerField && !doc[ownerField] && isAgentScoped(caller)) doc[ownerField] = agentScopeId(caller);
        attachActor(doc, caller);
        await saveValidated(doc);
        return serializeDoc(doc);
      },
      [names.update]: async (
        _: unknown,
        { id, ...fields }: { id: string } & Record<string, unknown>,
        { user }: GqlContext,
      ) => {
        const caller = requireAuth(user);
        if (cfg.immutable) {
          throw new GraphQLError("This record cannot be modified after creation", {
            extensions: { code: "FORBIDDEN" },
          });
        }
        const doc = await model.findById(id);
        if (!doc || doc.isDeleted) return null;
        assertCanAccess(caller, doc);
        const prepared = cfg.prepareUpdate ? cfg.prepareUpdate(defined(fields), caller, doc) : defined(fields);
        await assertOwnerInCompany(ownerField, prepared, doc.companyId);
        await assertRefsInCompany(cfg.relatedRefs, prepared, doc.companyId, caller.role === "SYSTEM_ADMIN");
        doc.set(prepared);
        attachActor(doc, caller);
        await saveValidated(doc);
        return serializeDoc(doc);
      },
      [names.remove]: async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
        const caller = requireRole(user, ...deleteRoles);
        const doc = await model.findById(id);
        if (!doc || doc.isDeleted) return false;
        if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== doc.companyId) {
          throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
        }
        doc.isDeleted = true;
        doc.deletedAt = new Date();
        attachActor(doc, caller);
        await saveValidated(doc);
        return true;
      },
    },
  };
}
