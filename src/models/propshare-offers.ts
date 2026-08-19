// Schemat propozycji współpracy PropShare przekazywanej między agentami różnych biur

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type PropShareOfferStatus =
  | "PENDING"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

const propShareOfferSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    propertyId:   { type: String, ref: "Property", required: true },
    fromAgentId:  { type: String, ref: "User",     required: true },
    fromCompanyId:{ type: String, ref: "Company",  required: true },
    toAgentId:    { type: String, ref: "User",     required: true },
    toCompanyId:  { type: String, ref: "Company",  required: true },
    enquiryId:    { type: String, ref: "Enquiry",  default: null },

    status: {
      type: String,
      enum: ["PENDING", "VIEWED", "ACCEPTED", "REJECTED", "WITHDRAWN"],
      default: "PENDING",
    },

    message:            { type: String, default: null },
    proposedCommission: { type: Number, default: null },

    viewedAt:     { type: Date, default: null },
    respondedAt:  { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

propShareOfferSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("propShareOffer");
});

propShareOfferSchema.plugin(activityLogPlugin, {
  entityName: "PropShareOffer",
  category: "PROPSHARE",
  prefix: "PROPSHARE",
  i18nBase: "log.propShare",
  labelField: "propertyId",
  refField: "propShareOfferId",
  fieldEvents: {
    status: { type: "PROPSHARE_STATUS_CHANGED", messageKey: "log.propShare.statusChanged" },
  },
});

propShareOfferSchema.index({ fromAgentId: 1, createdAt: -1 });
propShareOfferSchema.index({ toAgentId: 1, createdAt: -1 });

export const PropShareOffer = model("PropShareOffer", propShareOfferSchema);
