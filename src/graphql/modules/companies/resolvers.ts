// Zakładanie firm wraz z kontem administratora, edycja ustawień i dezaktywacja

import bcrypt from "bcryptjs";
import { Company } from "../../../models/companies.js";
import { User } from "../../../models/users.js";
import { GraphQLError } from "graphql";
import type { GqlContext } from "../../../types/context.js";
import { validateEmail, validatePassword } from "../../../utils/validate.js";
import { attachActor, saveValidated } from "../_shared/crud.js";

function requireAuth(user: GqlContext["user"]): NonNullable<GqlContext["user"]> {
  if (!user) {
    throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  }
  return user;
}

function requireRole(user: GqlContext["user"], ...roles: string[]) {
  const caller = requireAuth(user);
  if (!roles.includes(caller.role)) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  return caller;
}

const DEFAULT_LIST_LIMIT = 200;
const MAX_LIST_LIMIT = 500;

function mapCompany(c: InstanceType<typeof Company>) {
  const s = (c as any).settings ?? {};
  return {
    id: c._id,
    shortId: c.shortId,
    name: c.name,
    domain: (c as any).domain ?? null,
    logoUrl: (c as any).logoUrl ?? null,
    coverImageUrl: (c as any).coverImageUrl ?? null,
    isActive: c.isActive,
    type: (c as any).type ?? "REAL_ESTATE_COMPANY",
    settings: {
      nip: s.nip ?? null,
      website: s.website ?? null,
      phone: s.phone ?? null,
      email: s.email ?? null,
      address: s.address ?? null,
      licenseNumber: s.licenseNumber ?? null,
      timezone: s.timezone ?? "UTC",
      language: s.language ?? "en",
      formDisclaimer: s.formDisclaimer
        ? {
            pl: s.formDisclaimer.pl ?? null,
            en: s.formDisclaimer.en ?? null,
          }
        : null,
      dataRetentionDays: s.dataRetentionDays ?? null,
    },
    createdAt: (c as any).createdAt?.toISOString() ?? null,
  };
}

export const companyResolvers = {
  Query: {
    getCompanies: async (
      _: unknown,
      { limit, offset }: { limit?: number; offset?: number },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const take = Math.min(Math.max(Number(limit) || DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT);
      const skip = Math.max(Number(offset) || 0, 0);

      let companies: InstanceType<typeof Company>[];
      let totalCount: number;
      if (caller.role === "SYSTEM_ADMIN") {
        [companies, totalCount] = await Promise.all([
          Company.find().sort({ createdAt: -1 }).skip(skip).limit(take),
          Company.countDocuments(),
        ]);
      } else if (caller.companyId) {
        const company = await Company.findById(caller.companyId);
        companies = company ? [company] : [];
        totalCount = companies.length;
      } else {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      const counts = await User.aggregate([
        { $match: { companyId: { $in: companies.map((c) => c._id) }, isActive: true } },
        { $group: { _id: "$companyId", count: { $sum: 1 } } },
      ]);
      const countByCompany = new Map(counts.map((c) => [c._id as string, c.count as number]));

      const items = companies.map((c) => ({ ...mapCompany(c), userCount: countByCompany.get(c._id as string) ?? 0 }));
      return { items, totalCount, hasMore: skip + items.length < totalCount };
    },

    getCompanyById: async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
      if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
      if (user.role !== "SYSTEM_ADMIN" && user.companyId !== id) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      const c = await Company.findById(id);
      return c ? mapCompany(c) : null;
    },
  },

  Company: {
    userCount: async (parent: { id: string; userCount?: number }) => {
      if (typeof parent.userCount === "number") return parent.userCount;
      return User.countDocuments({ companyId: parent.id, isActive: true });
    },
  },

  Mutation: {
    createCompany: async (
      _: unknown,
      { name, domain, type, settings, adminEmail, adminName, adminPassword }: {
        name: string; domain?: string; type?: string; settings?: Record<string, unknown>;
        adminEmail: string; adminName: string; adminPassword: string;
      },
      { user }: GqlContext,
    ) => {
      const caller = requireRole(user, "SYSTEM_ADMIN");

      validateEmail(adminEmail);
      validatePassword(adminPassword);

      const existing = await Company.findOne({ name });
      if (existing) {
        throw new GraphQLError("A company with that name already exists.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const company = new Company({ name, domain, type: type ?? "REAL_ESTATE_COMPANY", settings: settings ?? {} });
      attachActor(company, caller);
      await saveValidated(company);

      const hashed = await bcrypt.hash(adminPassword, 12);
      const [firstName, ...rest] = adminName.trim().split(" ");
      const lastName = rest.join(" ");
      const admin = new User({
        email: adminEmail,
        password: hashed,
        name: adminName,
        role: "COMPANY_ADMIN",
        companyId: company._id,
        isActive: true,
        profile: { firstName, lastName },
      });
      attachActor(admin, caller);
      await saveValidated(admin);

      return mapCompany(company);
    },

    updateCompany: async (
      _: unknown,
      { id, settings, ...fields }: { id: string; name?: string; domain?: string; logoUrl?: string; coverImageUrl?: string; isActive?: boolean; settings?: Record<string, unknown> },
      { user }: GqlContext,
    ) => {
      const caller = requireRole(user, "SYSTEM_ADMIN", "COMPANY_ADMIN");
      if (caller.role === "COMPANY_ADMIN" && caller.companyId !== id) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }
      const company = await Company.findById(id);
      if (!company) return null;

      const update: Record<string, unknown> = { ...fields };
      if (settings) {
        for (const [key, val] of Object.entries(settings)) {
          update[`settings.${key}`] = val;
        }
      }
      company.set(update);
      attachActor(company, caller);
      await saveValidated(company);
      return mapCompany(company);
    },

    deactivateCompany: async (_: unknown, { id }: { id: string }, { user }: GqlContext) => {
      const caller = requireRole(user, "SYSTEM_ADMIN");
      const company = await Company.findById(id);
      if (!company) return null;
      company.isActive = false;
      attachActor(company, caller);
      await saveValidated(company);
      return mapCompany(company);
    },
  },
};
