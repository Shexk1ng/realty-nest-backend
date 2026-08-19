// Schemat szansy sprzedaży w lejku: etap, szacowana wartość i powiązania z ofertą oraz kontaktem

import { Schema, model, type Model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type PipelineStage = "NEW" | "QUALIFYING" | "SHOWING" | "NURTURE" | "OFFER" | "CLOSED" | "LOST";

const pipelineLeadSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    title: { type: String, required: true },
    stage: {
      type: String,
      enum: ["NEW", "QUALIFYING", "SHOWING", "NURTURE", "OFFER", "CLOSED", "LOST"],
      default: "NEW",
    },
    source: { type: String, default: null },
    estValue: { type: Schema.Types.Decimal128, default: 0 },
    companyId: { type: String, ref: "Company", required: true },
    agentId: { type: String, ref: "User", default: null },
    contactId: { type: String, ref: "Contact", default: null },
    propertyId: { type: String, ref: "Property", default: null },
    enquiryId: { type: String, ref: "Enquiry", default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false, collection: "leads" },
);

pipelineLeadSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("pipelineLead");
});

pipelineLeadSchema.plugin(activityLogPlugin, {
  entityName: "PipelineLead",
  category: "PIPELINE",
  prefix: "LEAD",
  i18nBase: "log.lead",
  labelField: "title",
  refField: "leadId",
  fieldEvents: {
    stage:     { type: "LEAD_STAGE_CHANGED", messageKey: "log.lead.stageChanged" },
    agentId:   { type: "LEAD_UPDATED",       messageKey: "log.lead.assigned" },
    isDeleted: { type: "LEAD_DELETED",       messageKey: "log.lead.deleted" },
  },
});

pipelineLeadSchema.index({ companyId: 1, createdAt: -1 });
pipelineLeadSchema.index({ companyId: 1, agentId: 1 });

export const PipelineLead: Model<any> = model("PipelineLead", pipelineLeadSchema);
