// Schemat kontaktu w bazie biura wraz ze źródłem pozyskania i datą udzielenia zgody

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type ContactKind = "CLIENT" | "COLLEAGUE" | "PARTNER" | "VENDOR";
export type ContactSource = "PORTAL" | "REFERRAL" | "DIRECT" | "SOCIAL" | "AGENCY";

const contactSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    name: { type: String, required: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    phone: { type: String, default: null },
    role: { type: String, default: null },
    notes: { type: String, default: null },
    kind: {
      type: String,
      enum: ["CLIENT", "COLLEAGUE", "PARTNER", "VENDOR"],
      default: "CLIENT",
    },
    source: {
      type: String,
      enum: ["PORTAL", "REFERRAL", "DIRECT", "SOCIAL", "AGENCY"],
      default: null,
    },
    companyId: { type: String, ref: "Company", required: true },
    ownerId: { type: String, ref: "User", default: null },

    consentGivenAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

contactSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("contact");
});

contactSchema.plugin(activityLogPlugin, {
  entityName: "Contact",
  category: "CONTACT",
  prefix: "CONTACT",
  i18nBase: "log.contact",
  labelField: "name",
  refField: "contactId",
  fieldEvents: {
    isDeleted: { type: "CONTACT_DELETED", messageKey: "log.contact.deleted" },
  },
});

contactSchema.index({ companyId: 1, createdAt: -1 });
contactSchema.index({ companyId: 1, ownerId: 1 });

export const Contact = model("Contact", contactSchema);
