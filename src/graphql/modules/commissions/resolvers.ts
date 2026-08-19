// Operacje CRUD na prowizjach oraz liczona po stronie serwera kwota i zestawienie zbiorcze

import { GraphQLError } from "graphql";
import { Commission } from "../../../models/commissions.js";
import { Property } from "../../../models/properties.js";
import { agentScopeId, makeCrudResolvers, toNumber } from "../_shared/crud.js";
import { relatedFieldResolvers } from "../_shared/briefs.js";
import type { GqlContext } from "../../../types/context.js";

function withAmountOnCreate(fields: Record<string, unknown>): Record<string, unknown> {
  const { salePrice, rate } = fields as { salePrice?: number; rate?: number };
  const { amount: _ignoredClientAmount, ...rest } = fields as Record<string, unknown> & { amount?: unknown };
  if (salePrice != null && rate != null) {
    return { ...rest, amount: Math.round((salePrice * rate) / 100) };
  }
  return rest;
}

function withAmountOnUpdate(fields: Record<string, unknown>, _caller: unknown, doc: any): Record<string, unknown> {
  const { salePrice, rate } = fields as { salePrice?: number; rate?: number };
  const { amount: _ignoredClientAmount, ...rest } = fields as Record<string, unknown> & { amount?: unknown };
  const effectiveSalePrice = salePrice ?? toNumber(doc.salePrice);
  const effectiveRate = rate ?? doc.rate;
  if (effectiveSalePrice != null && effectiveRate != null) {
    return { ...rest, amount: Math.round((effectiveSalePrice * effectiveRate) / 100) };
  }
  return rest;
}

const commissionResolversBase = makeCrudResolvers({
  model: Commission,
  names: {
    list: "getCommissions",
    create: "addCommission",
    update: "updateCommission",
    remove: "deleteCommission",
  },
  ownerField: "agentId",
  relatedRefs: [{ field: "propertyId", model: Property }],
  defaultSort: { dealDate: -1 },
  prepareCreate: withAmountOnCreate,
  prepareUpdate: withAmountOnUpdate,
});

async function commissionSummary(_p: unknown, _a: unknown, { user }: GqlContext) {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });

  const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
  if (user.role !== "SYSTEM_ADMIN") {
    filter.companyId = user.companyId;
    if (user.role === "AGENT" || user.role === "AGENT_ASSISTANT") filter.agentId = agentScopeId(user);
  }

  const docs = await Commission.find(filter).select("salePrice amount status").lean();
  const sum = { count: docs.length, totalSalePrice: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0, processingAmount: 0, disputedAmount: 0 };
  for (const d of docs as Array<{ salePrice?: unknown; amount?: unknown; status?: string }>) {
    const amount = toNumber(d.amount) ?? 0;
    sum.totalSalePrice += toNumber(d.salePrice) ?? 0;
    sum.totalAmount += amount;
    if (d.status === "PAID") sum.paidAmount += amount;
    else if (d.status === "PENDING") sum.pendingAmount += amount;
    else if (d.status === "PROCESSING") sum.processingAmount += amount;
    else if (d.status === "DISPUTED") sum.disputedAmount += amount;
  }
  return sum;
}

export const commissionResolvers = {
  ...commissionResolversBase,
  Query: {
    ...commissionResolversBase.Query,
    getCommissionSummary: commissionSummary,
  },
  Commission: relatedFieldResolvers,
};
