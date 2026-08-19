// Odczyt dziennika zdarzeń, statystyki i weryfikacja łańcucha skrótów dla administratorów

import { GraphQLError } from "graphql";
import { ActivityLog } from "../../../models/logs.js";
import type { GqlContext } from "../../../types/context.js";
import type { TokenPayload } from "../../../utils/jwt.js";
import { verifyAuditChain } from "../../../utils/auditChain.js";
import { sanitizeMongo, sanitizeScalar, validateString } from "../../../utils/validate.js";

function requireAuth(user: GqlContext["user"]): TokenPayload {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return user;
}

function requireAdmin(user: GqlContext["user"]): TokenPayload {
  const caller = requireAuth(user);
  if (!["SYSTEM_ADMIN", "COMPANY_ADMIN"].includes(caller.role)) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  return caller;
}

function scopeFilter(caller: TokenPayload): Record<string, unknown> {
  return caller.role === "SYSTEM_ADMIN" ? {} : { companyId: caller.companyId };
}

function mapLog(doc: any) {
  return {
    id: doc._id,
    shortId: doc.shortId ?? null,
    seq: doc.seq ?? null,
    type: doc.type,
    category: doc.category,
    messageKey: doc.messageKey,
    messageParamsJson: doc.messageParams ? JSON.stringify(doc.messageParams) : null,
    fallbackText: doc.fallbackText ?? null,
    actorId: doc.actorId ?? null,
    actorName: doc.actorName ?? null,
    actorRole: doc.actorRole ?? null,
    targetType: doc.targetType ?? null,
    targetId: doc.targetId ?? null,
    companyId: doc.companyId ?? null,
    ipAddress: doc.ipAddress ?? null,
    hash: doc.hash ?? null,
    prevHash: doc.prevHash ?? null,
    chainedAt: doc.chainedAt?.toISOString?.() ?? null,
    createdAt: doc.createdAt?.toISOString?.() ?? null,
  };
}

export const logResolvers = {
  Query: {
    getAuditLogs: async (
      _: unknown,
      { category, actorId, limit, offset }: { category?: string; actorId?: string; limit?: number; offset?: number },
      { user }: GqlContext,
    ) => {
      const caller = requireAdmin(user);
      const filter: Record<string, unknown> = scopeFilter(caller);

      const cat = validateString(category, "category", { max: 40 });
      if (cat) filter.category = sanitizeMongo(cat);
      const actor = sanitizeScalar(actorId, "actorId");
      if (actor) filter.actorId = sanitizeMongo(actor);

      const take = Math.min(Math.max(Number(limit) || 50, 1), 200);
      const skip = Math.max(Number(offset) || 0, 0);

      const docs = await ActivityLog.find(filter).sort({ seq: -1 }).skip(skip).limit(take).lean();
      return docs.map(mapLog);
    },

    auditChainStatus: async (_: unknown, __: unknown, { user }: GqlContext) => {
      const caller = requireAdmin(user);
      if (caller.role !== "SYSTEM_ADMIN") {
        throw new GraphQLError("Only a system administrator can verify the global audit chain.", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return verifyAuditChain(ActivityLog as never);
    },

    auditStats: async (_: unknown, __: unknown, { user }: GqlContext) => {
      const caller = requireAdmin(user);
      const filter = scopeFilter(caller);
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [total, last24h, byCategory] = await Promise.all([
        ActivityLog.countDocuments(filter),
        ActivityLog.countDocuments({ ...filter, createdAt: { $gte: since } }),
        ActivityLog.aggregate([
          { $match: filter },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
      ]);

      return [
        { key: "TOTAL", count: total },
        { key: "LAST_24H", count: last24h },
        ...byCategory.map((c: { _id: string; count: number }) => ({ key: c._id, count: c.count })),
      ];
    },
  },
};
