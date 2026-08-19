// Operacje CRUD na kontaktach oraz eksport i trwałe usunięcie danych osobowych zgodnie z RODO

import { GraphQLError } from "graphql";
import { Contact } from "../../../models/contacts.js";
import { Enquiry } from "../../../models/enquiries.js";
import { makeCrudResolvers } from "../_shared/crud.js";
import { logActivity } from "../../../utils/activityLog.js";
import { sanitizeMongo } from "../../../utils/validate.js";
import type { GqlContext } from "../../../types/context.js";
import type { TokenPayload } from "../../../utils/jwt.js";

function withConsent(fields: Record<string, unknown>): Record<string, unknown> {
  const { consent, ...rest } = fields as { consent?: boolean };
  if (consent === undefined) return rest;
  return { ...rest, consentGivenAt: consent ? new Date() : null };
}

const base = makeCrudResolvers({
  model: Contact,
  names: {
    list: "getContacts",
    create: "addContact",
    update: "updateContact",
    remove: "deleteContact",
  },
  ownerField: "ownerId",
  searchFields: ["name", "email", "phone", "role"],
  prepareCreate: withConsent,
  prepareUpdate: withConsent,
});

function requireAuth(user: GqlContext["user"]): TokenPayload {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return user;
}

async function loadOwnContact(id: string, user: GqlContext["user"]) {
  const caller = requireAuth(user);
  if (!["SYSTEM_ADMIN", "COMPANY_ADMIN", "MANAGER"].includes(caller.role)) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  const contact = await Contact.findById(sanitizeMongo(id)).lean();
  if (!contact) throw new GraphQLError("Not found", { extensions: { code: "NOT_FOUND" } });
  if (caller.role !== "SYSTEM_ADMIN" && (contact as { companyId?: string }).companyId !== caller.companyId) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  return { caller, contact };
}

export const contactResolvers = {
  ...base,
  Query: {
    ...base.Query,

    async exportContactData(_p: unknown, args: { id: string }, ctx: GqlContext) {
      const { caller, contact } = await loadOwnContact(args.id, ctx.user);
      const enquiries = await Enquiry.find({ contactId: (contact as { _id: string })._id }).lean();

      await logActivity({
        type: "CONTACT_DATA_EXPORTED",
        category: "CONTACT",
        messageKey: "log.contact.dataExported",
        fallbackText: "Wyeksportowano dane osobowe kontaktu",
        actor: { _id: caller.sub, shortId: caller.shortId, role: caller.role },
        target: { type: "Contact", id: (contact as { _id: string })._id, shortId: (contact as { shortId?: number }).shortId ?? null },
        companyId: (contact as { companyId?: string }).companyId ?? null,
      });

      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        contact,
        enquiries,
      });
    },
  },

  Mutation: {
    ...base.Mutation,

    async hardDeleteContact(_p: unknown, args: { id: string }, ctx: GqlContext) {
      const { caller, contact } = await loadOwnContact(args.id, ctx.user);
      const contactId = (contact as { _id: string })._id;
      const companyId = (contact as { companyId?: string }).companyId ?? null;

      await Contact.deleteOne({ _id: contactId });
      await Enquiry.updateMany({ contactId }, { $set: { contactId: null } });

      await logActivity({
        type: "CONTACT_HARD_DELETED",
        category: "CONTACT",
        messageKey: "log.contact.hardDeleted",
        fallbackText: "Trwale usunięto dane osobowe kontaktu (RODO art. 17)",
        actor: { _id: caller.sub, shortId: caller.shortId, role: caller.role },
        target: { type: "Contact", id: contactId, shortId: (contact as { shortId?: number }).shortId ?? null },
        companyId,
      });

      return true;
    },
  },
};
