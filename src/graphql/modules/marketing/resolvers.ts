// Operacje CRUD na kampaniach marketingowych wraz z nazwą powiązanego zapytania

import { Campaign } from "../../../models/campaigns.js";
import { Property } from "../../../models/properties.js";
import { Enquiry } from "../../../models/enquiries.js";
import { makeCrudResolvers } from "../_shared/crud.js";
import { enquiryBrief } from "../_shared/briefs.js";

const marketingResolversBase = makeCrudResolvers({
  model: Campaign,
  names: {
    list: "getCampaigns",
    create: "addCampaign",
    update: "updateCampaign",
    remove: "deleteCampaign",
  },
  ownerField: "ownerId",
  relatedRefs: [
    { field: "propertyId", model: Property },
    { field: "enquiryId", model: Enquiry },
  ],
  defaultSort: { startDate: -1 },
});

export const marketingResolvers = {
  ...marketingResolversBase,
  Campaign: {
    enquiryName: async (c: { enquiryId?: string | null }) =>
      (await enquiryBrief(c.enquiryId))?.name ?? null,
  },
};
