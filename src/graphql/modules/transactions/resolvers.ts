// Operacje CRUD na transakcjach wraz z danymi kupującego pobieranymi z kontaktu

import { Transaction } from "../../../models/transactions.js";
import { Property } from "../../../models/properties.js";
import { Contact } from "../../../models/contacts.js";
import { makeCrudResolvers } from "../_shared/crud.js";
import { relatedFieldResolvers, contactBrief } from "../_shared/briefs.js";

const transactionResolversBase = makeCrudResolvers({
  model: Transaction,
  names: {
    list: "getTransactions",
    create: "addTransaction",
    update: "updateTransaction",
    remove: "deleteTransaction",
  },
  ownerField: "agentId",
  relatedRefs: [
    { field: "propertyId", model: Property },
    { field: "buyerContactId", model: Contact },
  ],
  defaultSort: { createdAt: -1 },
});

export const transactionResolvers = {
  ...transactionResolversBase,
  Transaction: {
    ...relatedFieldResolvers,
    contactName: async (t: { buyerContactId?: string | null; buyerName?: string | null }) =>
      (await contactBrief(t.buyerContactId))?.name ?? t.buyerName ?? null,
    contactEmail: async (t: { buyerContactId?: string | null }) =>
      (await contactBrief(t.buyerContactId))?.email ?? null,
    contactPhone: async (t: { buyerContactId?: string | null }) =>
      (await contactBrief(t.buyerContactId))?.phone ?? null,
  },
};
