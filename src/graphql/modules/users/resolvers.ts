// Zarządzanie kontami: role, profil, hasło i przypisanie asystenta do agenta prowadzącego

import bcrypt from "bcryptjs";
import { User } from "../../../models/users.js";
import { Company } from "../../../models/companies.js";
import { GraphQLError } from "graphql";
import type { GqlContext } from "../../../types/context.js";
import type { TokenPayload } from "../../../utils/jwt.js";
import { validateEmail, validatePassword } from "../../../utils/validate.js";
import { attachActor, requireRole, saveValidated } from "../_shared/crud.js";

const COMPANY_ROLES = ["COMPANY_ADMIN", "MANAGER", "AGENT", "AGENT_ASSISTANT"];
const ASSIGNMENT_ROLES = ["SYSTEM_ADMIN", "COMPANY_ADMIN", "MANAGER"];
const DEFAULT_LIST_LIMIT = 200;
const MAX_LIST_LIMIT = 500;

function requireAuth(user: GqlContext["user"]): TokenPayload {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return user;
}

function canManageUsers(user: GqlContext["user"]) {
  if (!user || !["SYSTEM_ADMIN", "COMPANY_ADMIN"].includes(user.role)) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
}

async function resolveAssignedAgent(
  raw: string | null | undefined,
  targetRole: string,
  targetCompanyId: string | null,
  caller: TokenPayload,
): Promise<string | null> {
  if (!ASSIGNMENT_ROLES.includes(caller.role)) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  if (!raw) return null;
  if (targetRole !== "AGENT_ASSISTANT") {
    throw new GraphQLError("Only an agent assistant can be assigned to a lead agent.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  const agent = await User.findById(raw).select("role companyId isActive").lean();
  const found = agent as { role?: string; companyId?: string | null; isActive?: boolean } | null;
  if (!found || found.role !== "AGENT" || found.companyId !== targetCompanyId) {
    throw new GraphQLError("Invalid lead agent: not an agent in this company.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return raw;
}

function mapProfile(doc: any) {
  const p = doc.profile ?? {};
  return {
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    fullName: doc.fullName ?? doc.name,
    phone: p.phone ?? null,
    phoneMobile: p.phoneMobile ?? null,
    avatarUrl: p.avatarUrl ?? null,
    profilePictureUrl: p.profilePictureUrl ?? null,
    bio: p.bio ?? null,
    jobTitle: p.jobTitle ?? null,
    licenseNumber: p.licenseNumber ?? null,
    timezone: p.timezone ?? "UTC",
    language: p.language ?? "en",
  };
}

function mapUser(doc: any) {
  return {
    id: doc._id,
    shortId: doc.shortId,
    email: doc.email,
    name: doc.name,
    profile: mapProfile(doc),
    role: doc.role,
    companyId: doc.companyId ?? null,
    assignedAgentId: doc.assignedAgentId ?? null,
    isActive: doc.isActive,
    deactivatedAt: doc.deactivatedAt?.toISOString() ?? null,
    twoFactorEnabled: doc.twoFactor?.enabled ?? false,
    lastLoginAt: doc.lastLoginAt?.toISOString() ?? null,
    createdAt: doc.createdAt?.toISOString() ?? null,
  };
}

export const userResolvers = {
  Query: {
    getUsers: async (
      _: unknown,
      { companyId, limit, offset }: { companyId?: string; limit?: number; offset?: number },
      { user }: GqlContext,
    ) => {
      const caller = requireRole(user, "SYSTEM_ADMIN", "COMPANY_ADMIN", "MANAGER");
      const filter = caller.role === "SYSTEM_ADMIN"
        ? (companyId ? { companyId } : {})
        : { companyId: caller.companyId };
      const take = Math.min(Math.max(Number(limit) || DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT);
      const skip = Math.max(Number(offset) || 0, 0);
      const [docs, totalCount] = await Promise.all([
        User.find(filter).skip(skip).limit(take),
        User.countDocuments(filter),
      ]);

      const companyIds = [...new Set(docs.map((d) => d.companyId).filter(Boolean))] as string[];
      const companies = companyIds.length
        ? await Company.find({ _id: { $in: companyIds } }).select("name logoUrl coverImageUrl")
        : [];
      const companyById = new Map(
        companies.map((c) => [
          c._id as string,
          { id: c._id, name: c.name, logoUrl: (c as any).logoUrl ?? null, coverImageUrl: (c as any).coverImageUrl ?? null },
        ]),
      );

      const items = docs.map((d) => ({
        ...mapUser(d),
        _companyBrief: d.companyId ? (companyById.get(d.companyId) ?? null) : null,
      }));
      return { items, totalCount, hasMore: skip + items.length < totalCount };
    },

    getUserById: async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
      const caller = requireAuth(user);
      const doc = await User.findById(id);
      if (!doc) return null;
      if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== doc.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      return mapUser(doc);
    },

    me: async (_: unknown, __: unknown, { user }: GqlContext) => {
      const caller = requireAuth(user);
      const doc = await User.findById(caller.sub);
      return doc ? mapUser(doc) : null;
    },
  },

  Mutation: {
    createUser: async (
      _: unknown,
      { email, password, name, role, companyId, profile, assignedAgentId }: {
        email: string; password: string; name: string; role: string;
        companyId?: string;
        assignedAgentId?: string | null;
        profile?: {
          firstName?: string; lastName?: string; phone?: string; phoneMobile?: string;
          avatarUrl?: string; bio?: string; jobTitle?: string; licenseNumber?: string;
          timezone?: string; language?: string;
        };
      },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      canManageUsers(caller);

      if (caller.role === "COMPANY_ADMIN") {
        if (!COMPANY_ROLES.includes(role)) {
          throw new GraphQLError("Cannot assign that role", { extensions: { code: "FORBIDDEN" } });
        }
        companyId = caller.companyId ?? undefined;
      }

      validateEmail(email);
      validatePassword(password);

      const leadAgentId =
        assignedAgentId === undefined
          ? null
          : await resolveAssignedAgent(assignedAgentId, role, companyId ?? null, caller);

      const hashed = await bcrypt.hash(password, 12);
      const doc = new User({
        email: email.trim().toLowerCase(), password: hashed, name, role,
        companyId: companyId ?? null,
        assignedAgentId: leadAgentId,
        profile: profile ?? {},
      });
      attachActor(doc, caller);
      await saveValidated(doc);
      return mapUser(doc);
    },

    updateUser: async (
      _: unknown,
      { id, assignedAgentId, ...fields }: {
        id: string; name?: string; role?: string; isActive?: boolean; assignedAgentId?: string | null;
      },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);

      const assignmentOnly =
        assignedAgentId !== undefined &&
        fields.name === undefined &&
        fields.role === undefined &&
        fields.isActive === undefined;
      if (!(caller.role === "MANAGER" && assignmentOnly)) canManageUsers(caller);

      const target = await User.findById(id);
      if (!target) return null;
      if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== target.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      if (fields.role !== undefined && caller.role === "COMPANY_ADMIN" && !COMPANY_ROLES.includes(fields.role)) {
        throw new GraphQLError("Cannot assign that role", { extensions: { code: "FORBIDDEN" } });
      }
      target.set(fields);

      if (assignedAgentId !== undefined) {
        target.assignedAgentId = await resolveAssignedAgent(
          assignedAgentId, target.role, target.companyId ?? null, caller,
        );
      }
      if (target.role !== "AGENT_ASSISTANT") target.assignedAgentId = null;

      if (fields.isActive !== undefined) {
        target.deactivatedAt = fields.isActive ? null : new Date();
      }
      attachActor(target, caller);
      await saveValidated(target);
      return mapUser(target);
    },

    updateProfile: async (
      _: unknown,
      { id, profile }: { id: string; profile: Record<string, unknown> },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      if (caller.sub !== id) canManageUsers(caller);

      const existing = await User.findById(id);
      if (!existing) return null;

      if (
        caller.sub !== id &&
        caller.role === "COMPANY_ADMIN" &&
        caller.companyId !== existing.companyId
      ) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      const update: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(profile)) {
        update[`profile.${k}`] = v;
      }

      const profileDoc = existing.profile as { toObject?: () => Record<string, unknown> } | null | undefined;
      const existingProfile =
        profileDoc && typeof profileDoc.toObject === "function"
          ? profileDoc.toObject()
          : { ...(profileDoc ?? {}) };
      const merged = { ...existingProfile, ...profile };
      const fullName = [merged.firstName, merged.lastName].filter(Boolean).join(" ");
      if (fullName) update.name = fullName;

      existing.set(update);
      attachActor(existing, caller);
      await saveValidated(existing);
      return mapUser(existing);
    },

    changePassword: async (
      _: unknown,
      { id, currentPassword, newPassword }: { id: string; currentPassword: string; newPassword: string },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const isSelf = caller.sub === id;
      if (!isSelf && !["SYSTEM_ADMIN", "COMPANY_ADMIN"].includes(caller.role)) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      const doc = await User.findById(id);
      if (!doc) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
      if (!isSelf && caller.role === "COMPANY_ADMIN" && caller.companyId !== doc.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      if (isSelf) {
        const valid = await bcrypt.compare(currentPassword, doc.password);
        if (!valid) throw new GraphQLError("Current password is incorrect", { extensions: { code: "BAD_USER_INPUT" } });
        if (currentPassword === newPassword) {
          throw new GraphQLError("New password must be different from the current one.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      validatePassword(newPassword);

      doc.password = await bcrypt.hash(newPassword, 12);
      attachActor(doc, caller);
      await saveValidated(doc);
      return true;
    },

    deactivateUser: async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
      const caller = requireAuth(user);
      canManageUsers(caller);
      const doc = await User.findById(id);
      if (!doc) return null;
      if (caller.role === "COMPANY_ADMIN" && caller.companyId !== doc.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      doc.isActive = false;
      doc.deactivatedAt = new Date();
      attachActor(doc, caller);
      await saveValidated(doc);
      return mapUser(doc);
    },
  },

  User: {
    company: async (parent: { companyId?: string | null; _companyBrief?: unknown }) => {
      if (parent._companyBrief !== undefined) return parent._companyBrief;
      if (!parent.companyId) return null;
      const c = await Company.findById(parent.companyId);
      if (!c) return null;
      return {
        id: c._id,
        name: c.name,
        logoUrl: (c as any).logoUrl ?? null,
        coverImageUrl: (c as any).coverImageUrl ?? null,
      };
    },
  },
};
