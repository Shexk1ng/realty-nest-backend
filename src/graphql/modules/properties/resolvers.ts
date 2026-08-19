// Obsługa ofert nieruchomości: zasięg odczytu agenta, edycja, publikacja treści i widok publiczny

import { Property } from "../../../models/properties.js";
import { User } from "../../../models/users.js";
import { GraphQLError } from "graphql";
import type { GqlContext } from "../../../types/context.js";
import type { TokenPayload } from "../../../utils/jwt.js";
import { agentScopeId, isUnassignedAssistant, saveValidated, serializeDoc, toNumber } from "../_shared/crud.js";
import { sanitizeMongo } from "../../../utils/validate.js";

const DEFAULT_LIST_LIMIT = 200;
const MAX_LIST_LIMIT = 500;

function requireAuth(user: GqlContext["user"]): TokenPayload {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return user;
}

function defined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

const PUBLIC_PROPERTY_FIELDS = [
  "shortId", "title", "description", "price", "location",
  "transactionType", "propertyType", "market",
  "area", "plotArea", "rooms", "bedrooms", "bathrooms", "floor", "totalFloors", "yearBuilt",
  "energyClass", "availableFrom", "features", "address",
  "imageUrl", "images", "virtualTourUrl", "floorPlanUrl",
].join(" ");

const PUBLIC_COORD_DECIMALS = 2;

function roundCoord(value: unknown): number | null {
  const n = toNumber(value);
  if (n === null) return null;
  const factor = 10 ** PUBLIC_COORD_DECIMALS;
  return Math.round(n * factor) / factor;
}

function isoDate(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function toPublicProperty(property: any) {
  const address = property.address ?? {};
  return {
    id: String(property._id),
    shortId: property.shortId,
    title: property.title,
    description: property.description ?? null,
    price: toNumber(property.price),
    location: property.location,

    transactionType: property.transactionType ?? null,
    propertyType: property.propertyType ?? null,
    market: property.market ?? null,

    area: toNumber(property.area),
    plotArea: toNumber(property.plotArea),
    rooms: property.rooms ?? null,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    floor: property.floor ?? null,
    totalFloors: property.totalFloors ?? null,
    yearBuilt: property.yearBuilt ?? null,
    pricePerM2: property.pricePerM2 ?? null,

    energyClass: property.energyClass ?? null,
    availableFrom: isoDate(property.availableFrom),

    features: toStringArray(property.features),
    address: {
      street: address.street ?? null,
      district: address.district ?? null,
      city: address.city ?? null,
      postalCode: address.postalCode ?? null,
      country: address.country ?? null,
      approxLat: roundCoord(address.lat),
      approxLng: roundCoord(address.lng),
    },

    imageUrl: property.imageUrl ?? null,
    images: toStringArray(property.images),
    virtualTourUrl: property.virtualTourUrl ?? null,
    floorPlanUrl: property.floorPlanUrl ?? null,
  };
}

async function resolveLeadAgent(
  requested: unknown,
  caller: TokenPayload,
  companyId: string | null | undefined,
): Promise<string | null> {
  if (caller.role === "AGENT" || caller.role === "AGENT_ASSISTANT") return agentScopeId(caller);
  if (typeof requested !== "string" || !requested.trim()) return null;
  const agentId = requested.trim();
  const agent = await User.findById(sanitizeMongo(agentId)).select("companyId role").lean();
  if (!agent || (agent as { companyId?: string | null }).companyId !== companyId) {
    throw new GraphQLError("Invalid agentId: user not found in this company.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  if ((agent as { role?: string }).role !== "AGENT") {
    throw new GraphQLError("Invalid agentId: the lead agent must have the AGENT role.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return agentId;
}

async function setContentApproval(id: string, approve: boolean, user: GqlContext["user"]) {
  const caller = requireAuth(user);
  if (!["SYSTEM_ADMIN", "COMPANY_ADMIN", "MANAGER"].includes(caller.role)) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  const property = await Property.findById(sanitizeMongo(id));
  if (!property || property.isDeleted) return null;
  if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== property.companyId) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  property.contentApprovedAt = approve ? new Date() : null;
  property.$locals = {
    ...(property.$locals ?? {}),
    actor: { _id: caller.sub, shortId: caller.shortId, role: caller.role },
  };
  await saveValidated(property);
  return serializeDoc(property);
}

export const propertyResolvers = {
  Query: {
    getProperties: async (
      _: unknown,
      { companyId, agentId, status, search, limit, offset }: {
        companyId?: string; agentId?: string; status?: string; search?: string; limit?: number; offset?: number;
      },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

      if (caller.role === "SYSTEM_ADMIN") {
        if (companyId) filter.companyId = sanitizeMongo(companyId);
      } else {
        filter.companyId = caller.companyId;
        if (caller.role === "AGENT" || caller.role === "AGENT_ASSISTANT") {
          filter.agentId = agentScopeId(caller);
        }
      }

      if (agentId && caller.role !== "AGENT" && caller.role !== "AGENT_ASSISTANT") {
        filter.agentId = sanitizeMongo(agentId);
      }
      if (status) filter.status = sanitizeMongo(status);
      if (search?.trim()) filter.$text = { $search: search.trim() };

      const take = Math.min(Math.max(Number(limit) || DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT);
      const skip = Math.max(Number(offset) || 0, 0);
      const projection = search?.trim() ? { score: { $meta: "textScore" } } : undefined;
      const sort = search?.trim() ? { score: { $meta: "textScore" } } : { createdAt: -1 };
      const [items, totalCount] = await Promise.all([
        Property.find(filter, projection).sort(sort as any).skip(skip).limit(take),
        Property.countDocuments(filter),
      ]);
      return { items: items.map(serializeDoc), totalCount, hasMore: skip + items.length < totalCount };
    },

    getPublicProperty: async (_: unknown, { id }: { id: string }) => {
      const property = await Property.findOne({
        _id: sanitizeMongo(id),
        isDeleted: { $ne: true },
        contentApprovedAt: { $ne: null },
        status: "ACTIVE",
      }).select(PUBLIC_PROPERTY_FIELDS);
      return property ? toPublicProperty(property) : null;
    },

    getPropertyById: async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
      const caller = requireAuth(user);
      if (isUnassignedAssistant(caller)) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      const property = await Property.findById(id);
      if (!property || property.isDeleted) return null;
      if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== property.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      if (
        (caller.role === "AGENT" || caller.role === "AGENT_ASSISTANT") &&
        property.agentId !== agentScopeId(caller)
      ) {
        return null;
      }
      return serializeDoc(property);
    },
  },

  Mutation: {
    addProperty: async (
      _: unknown,
      { agentId, ...fields }: Record<string, unknown> & { agentId?: string },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      if (!caller.companyId && caller.role !== "SYSTEM_ADMIN") {
        throw new GraphQLError("No company associated", { extensions: { code: "FORBIDDEN" } });
      }
      if (isUnassignedAssistant(caller)) {
        throw new GraphQLError("No agent assigned to this assistant account", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      const leadAgentId = await resolveLeadAgent(agentId, caller, caller.companyId);
      const property = new Property({
        ...defined(fields),
        companyId: caller.companyId,
        agentId: leadAgentId,
        status: (fields.status as string) ?? "ACTIVE",
      });
      await saveValidated(property);
      return property;
    },

    updateProperty: async (
      _: unknown,
      { id, ...fields }: { id: string } & Record<string, unknown>,
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const property = await Property.findById(id);
      if (!property || property.isDeleted) return null;
      if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== property.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      if ((caller.role === "AGENT" || caller.role === "AGENT_ASSISTANT") && property.agentId !== agentScopeId(caller)) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      const patch = defined(fields);
      delete patch.agentId;
      const leadAgentId = await resolveLeadAgent(fields.agentId, caller, property.companyId);
      if (leadAgentId) patch.agentId = leadAgentId;

      property.set(patch);
      property.$locals = {
        ...(property.$locals ?? {}),
        actor: { _id: caller.sub, shortId: caller.shortId, role: caller.role },
      };
      await saveValidated(property);
      return property;
    },

    deleteProperty: async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
      const caller = requireAuth(user);
      if (!["SYSTEM_ADMIN", "COMPANY_ADMIN"].includes(caller.role)) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      const property = await Property.findById(id);
      if (!property || property.isDeleted) return false;
      if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== property.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      property.isDeleted = true;
      property.deletedAt = new Date();
      property.propShareListed = false;
      property.propShareListedAt = null;
      property.$locals = {
        ...(property.$locals ?? {}),
        actor: { _id: caller.sub, shortId: caller.shortId, role: caller.role },
      };
      await saveValidated(property);
      return true;
    },

    publishPropertyContent: async (_: unknown, { id }: { id: string }, { user }: GqlContext) =>
      setContentApproval(id, true, user),

    unpublishPropertyContent: async (_: unknown, { id }: { id: string }, { user }: GqlContext) =>
      setContentApproval(id, false, user),
  },

  Property: {
    price: (p: any) => toNumber(p.price),
    monthlyRent: (p: any) => toNumber(p.monthlyRent),
    deposit: (p: any) => toNumber(p.deposit),
  },
};
