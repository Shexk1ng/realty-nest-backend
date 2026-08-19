// Schemat zapytania od klienta: dane kontaktowe, budżet, priorytet i status obsługi

import { Schema, model, type Model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type EnquiryStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "NEGOTIATING" | "LOST";
export type EnquiryPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type EnquirySource = "PORTAL" | "REFERRAL" | "DIRECT" | "SOCIAL" | "AGENCY";

const enquirySchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    name: { type: String, required: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    phone: { type: String, default: null },
    propertyInterest: { type: String, default: null },
    location: { type: String, default: null },
    budget: { type: Schema.Types.Decimal128, default: 0 },
    note: { type: String, default: null },
    source: {
      type: String,
      enum: ["PORTAL", "REFERRAL", "DIRECT", "SOCIAL", "AGENCY"],
      default: "DIRECT",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATING", "LOST"],
      default: "NEW",
    },
    companyId: { type: String, ref: "Company", required: true },
    agentId: { type: String, ref: "User", default: null },
    propertyId: { type: String, ref: "Property", default: null },

    consentGivenAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

enquirySchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("enquiry");
});

enquirySchema.plugin(activityLogPlugin, {
  entityName: "Enquiry",
  category: "ENQUIRY",
  prefix: "ENQUIRY",
  i18nBase: "log.enquiry",
  labelField: "name",
  refField: "enquiryId",
  fieldEvents: {
    status:    { type: "ENQUIRY_STATUS_CHANGED", messageKey: "log.enquiry.statusChanged" },
    agentId:   { type: "ENQUIRY_ASSIGNED",        messageKey: "log.enquiry.assigned" },
    isDeleted: { type: "ENQUIRY_DELETED",         messageKey: "log.enquiry.deleted" },
  },
});

enquirySchema.index({ companyId: 1, createdAt: -1 });
enquirySchema.index({ companyId: 1, agentId: 1 });

export const Enquiry: Model<any> = model("Enquiry", enquirySchema);
