// Operacje CRUD na szansach sprzedaży wraz z nazwami powiązanych rekordów

import { PipelineLead } from "../../../models/leads.js";
import { Contact } from "../../../models/contacts.js";
import { Property } from "../../../models/properties.js";
import { Enquiry } from "../../../models/enquiries.js";
import { makeCrudResolvers } from "../_shared/crud.js";
import { relatedFieldResolvers, enquiryBrief } from "../_shared/briefs.js";

const pipelineResolversBase = makeCrudResolvers({
  model: PipelineLead,
  names: {
    list: "getLeads",
    create: "addLead",
    update: "updateLead",
    remove: "deleteLead",
  },
  ownerField: "agentId",
  relatedRefs: [
    { field: "contactId", model: Contact },
    { field: "propertyId", model: Property },
    { field: "enquiryId", model: Enquiry },
  ],
});

export const pipelineResolvers = {
  ...pipelineResolversBase,
  PipelineLead: {
    ...relatedFieldResolvers,
    enquiryName: async (l: { enquiryId?: string | null }) =>
      (await enquiryBrief(l.enquiryId))?.name ?? null,
  },
};
