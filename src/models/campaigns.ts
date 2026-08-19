// Schemat kampanii marketingowej z budżetem, kanałem oraz licznikami wyświetleń i kliknięć

import { Schema, model, type Model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type CampaignStatus = "ACTIVE" | "PAUSED" | "ENDED" | "DRAFT";
export type CampaignChannel = "EMAIL" | "SOCIAL" | "PORTAL" | "SEARCH" | "DIRECT";

const campaignSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    name: { type: String, required: true },
    channel: {
      type: String,
      enum: ["EMAIL", "SOCIAL", "PORTAL", "SEARCH", "DIRECT"],
      default: "DIRECT",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "ENDED", "DRAFT"],
      default: "DRAFT",
    },
    budget: { type: Schema.Types.Decimal128, default: 0 },
    spent: { type: Schema.Types.Decimal128, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    companyId: { type: String, ref: "Company", required: true },
    ownerId: { type: String, ref: "User", default: null },
    propertyId: { type: String, ref: "Property", default: null },
    enquiryId:  { type: String, ref: "Enquiry", default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

campaignSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("campaign");
});

campaignSchema.plugin(activityLogPlugin, {
  entityName: "Campaign",
  category: "CAMPAIGN",
  prefix: "CAMPAIGN",
  i18nBase: "log.campaign",
  labelField: "name",
  refField: "campaignId",
  fieldEvents: {
    status: { type: "CAMPAIGN_UPDATED", messageKey: "log.campaign.statusChanged" },
    isDeleted: { type: "CAMPAIGN_DELETED", messageKey: "log.campaign.deleted" },
  },
});

campaignSchema.index({ companyId: 1, createdAt: -1 });
campaignSchema.index({ companyId: 1, ownerId: 1 });

export const Campaign: Model<any> = model("Campaign", campaignSchema);
