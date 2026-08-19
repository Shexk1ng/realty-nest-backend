// Obsługa zapytań: CRUD, automatyczny przydział agenta i zgłoszenia z formularza publicznego

import { GraphQLError } from "graphql";
import { Enquiry } from "../../../models/enquiries.js";
import { Company } from "../../../models/companies.js";
import { User } from "../../../models/users.js";
import { Property } from "../../../models/properties.js";
import { EnquiryAllocation } from "../../../models/enquiry-allocations.js";
import {
  makeCrudResolvers, requireAuth, defined, serializeDoc, attachActor,
  agentScopeId, isUnassignedAssistant,
} from "../_shared/crud.js";
import { validateString, validatePhone, validateEmail, validateEnum } from "../../../utils/validate.js";
import type { GqlContext } from "../../../types/context.js";

const VALID_SOURCES   = ["PORTAL", "REFERRAL", "DIRECT", "SOCIAL", "AGENCY"] as const;
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const VALID_STATUSES  = ["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATING", "LOST"] as const;

const base = makeCrudResolvers({
  model: Enquiry,
  names: {
    list: "getEnquiries",
    byId: "getEnquiryById",
    create: "addEnquiry",
    update: "updateEnquiry",
    remove: "deleteEnquiry",
  },
  ownerField: "agentId",
  relatedRefs: [{ field: "propertyId", model: Property }],
  searchFields: ["name", "email", "phone", "propertyInterest", "location"],
});

async function autoAllocate(enquiryId: string, companyId: string): Promise<string | null> {
  try {
    const agents = await User.find({
      companyId,
      allocationEnabled: true,
      isActive: true,
      role: { $in: ["AGENT", "MANAGER", "COMPANY_ADMIN"] },
    }).sort({ allocationQueueOrder: 1, name: 1 });

    if (!agents.length) return null;

    const recentAllocs = await EnquiryAllocation.find({ companyId })
      .sort({ allocatedAt: -1 })
      .limit(agents.length * 3);

    const lastAllocMap = new Map<string, Date>();
    for (const a of recentAllocs) {
      if (!lastAllocMap.has(a.agentId)) {
        lastAllocMap.set(a.agentId, a.allocatedAt);
      }
    }

    let chosen = agents[0]!;
    let oldestTime = lastAllocMap.get(chosen._id as string) ?? new Date(0);

    for (const agent of agents.slice(1)) {
      const t = lastAllocMap.get(agent._id as string) ?? new Date(0);
      if (t < oldestTime) {
        oldestTime = t;
        chosen = agent;
      }
    }

    await EnquiryAllocation.create({
      enquiryId,
      agentId: chosen._id,
      companyId,
      method: "AUTO",
      allocatedAt: new Date(),
    });

    return chosen._id as string;
  } catch {
    return null;
  }
}

export const enquiryResolvers = {
  Query: base.Query,
  Mutation: {
    ...base.Mutation,

    submitPublicEnquiry: async (
      _: unknown,
      {
        firstName,
        lastName,
        phone,
        companyId,
        propertyInterest,
        note,
        consent,
      }: {
        firstName: string;
        lastName: string;
        phone: string;
        companyId: string;
        propertyInterest?: string;
        note?: string;
        consent?: boolean;
      },
    ) => {
      const validFirst = validateString(firstName, "First name", { required: true, min: 1, max: 80 })!;
      const validLast  = validateString(lastName,  "Last name",  { required: true, min: 1, max: 80 })!;
      const validPhone = validatePhone(phone, "Phone");
      const validProp  = validateString(propertyInterest, "Property", { max: 200 });
      const validNote  = validateString(note, "Additional comments", { max: 2000 });

      const company = await Company.findById(companyId).select("_id isActive").lean();
      if (!company || !(company as any).isActive) {
        throw new GraphQLError("Invalid destination. Please refresh and try again.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const name = `${validFirst} ${validLast}`.trim();
      const doc = new Enquiry({
        name,
        phone: validPhone,
        propertyInterest: validProp,
        note: validNote,
        source: "DIRECT",
        priority: "MEDIUM",
        status: "NEW",
        companyId,
        consentGivenAt: consent ? new Date() : null,
      });
      await doc.save();

      await autoAllocate(doc._id as string, companyId).catch(() => null);

      return true;
    },

    addEnquiry: async (_: unknown, fields: Record<string, unknown>, { user }: GqlContext) => {
      const caller = requireAuth(user);
      if (isUnassignedAssistant(caller)) {
        throw new GraphQLError("No agent assigned to this assistant account", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      const companyId = caller.companyId;
      if (!companyId && caller.role !== "SYSTEM_ADMIN") {
        throw new GraphQLError("No company associated.", { extensions: { code: "FORBIDDEN" } });
      }

      const name     = validateString(fields.name,  "Name",  { required: true, min: 1, max: 160 })!;
      const phone    = validatePhone(fields.phone, "Phone");
      const email    = fields.email ? validateEmail(fields.email as string) : null;
      const propInt  = validateString(fields.propertyInterest, "Property interest", { max: 200 });
      const location = validateString(fields.location,         "Location",          { max: 200 });
      const note     = validateString(fields.note,             "Note",              { max: 2000 });
      const source   = validateEnum(fields.source,   VALID_SOURCES,   "Source")   ?? "DIRECT";
      const priority = validateEnum(fields.priority, VALID_PRIORITIES, "Priority") ?? "MEDIUM";
      const status   = validateEnum(fields.status,   VALID_STATUSES,   "Status")   ?? "NEW";

      const budget = fields.budget != null ? Number(fields.budget) : undefined;
      if (budget !== undefined && (isNaN(budget) || budget < 0)) {
        throw new GraphQLError("Budget must be a non-negative number.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (fields.propertyId && caller.role !== "SYSTEM_ADMIN") {
        const prop = await Property.findById(fields.propertyId as string).select("companyId").lean();
        if (!prop || (prop as { companyId?: string | null }).companyId !== companyId) {
          throw new GraphQLError("Invalid propertyId: record not found in this company.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      const prepared = defined({
        name, phone, email, propertyInterest: propInt, location, note,
        source, priority, status,
        budget,
        agentId: fields.agentId ?? null,
        propertyId: fields.propertyId ?? null,
        companyId,
      });

      const doc = new Enquiry(prepared);

      if (!doc.agentId && ["AGENT", "AGENT_ASSISTANT"].includes(caller.role)) {
        doc.agentId = agentScopeId(caller);
      }

      attachActor(doc, caller);
      await doc.save();

      if (!doc.agentId && companyId) {
        const allocatedAgentId = await autoAllocate(doc._id as string, companyId);
        if (allocatedAgentId) {
          doc.agentId = allocatedAgentId;
          attachActor(doc, caller);
          await doc.save();
        }
      } else if (doc.agentId && companyId) {
        await EnquiryAllocation.create({
          enquiryId: doc._id,
          agentId: doc.agentId,
          companyId,
          method: "MANUAL",
          allocatedAt: new Date(),
        }).catch(() => {});
      }

      return serializeDoc(doc);
    },
  },
};
