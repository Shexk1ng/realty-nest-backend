// Schemat biura nieruchomości jako najemcy systemu wraz z ustawieniami i klauzulą formularza

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type CompanyType = "PLATFORM" | "REAL_ESTATE_COMPANY";

const addressSchema = new Schema(
  {
    street: { type: String, default: null },
    city: { type: String, default: null },
    postalCode: { type: String, default: null },
    country: { type: String, default: null },
  },
  { _id: false },
);

const formDisclaimerLocaleSchema = new Schema(
  {
    text: { type: String, default: null },
    linkLabel: { type: String, default: null },
    linkUrl: { type: String, default: null },
  },
  { _id: false },
);

const formDisclaimerSchema = new Schema(
  {
    pl: { type: formDisclaimerLocaleSchema, default: () => ({}) },
    en: { type: formDisclaimerLocaleSchema, default: () => ({}) },
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    nip: { type: String, default: null },
    website: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    address: { type: addressSchema, default: () => ({}) },
    licenseNumber: { type: String, default: null },
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },
    formDisclaimer: { type: formDisclaimerSchema, default: () => ({}) },
    dataRetentionDays: { type: Number, default: null },
  },
  { _id: false },
);

const companySchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    name: { type: String, required: true, unique: true },
    domain: { type: String, default: null },
    logoUrl: { type: String, default: null },
    coverImageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ["PLATFORM", "REAL_ESTATE_COMPANY"],
      default: "REAL_ESTATE_COMPANY",
    },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true, _id: false },
);

companySchema.pre("save", async function () {
  if (this.isNew) {
    this.shortId = await nextSeq("company");
  }
});

companySchema.plugin(activityLogPlugin, {
  entityName: "Company",
  category: "COMPANY",
  prefix: "COMPANY",
  i18nBase: "log.company",
  labelField: "name",
  fieldEvents: {
    settings: { type: "COMPANY_SETTINGS_UPDATED", messageKey: "log.company.settingsUpdated" },
    isActive: { type: "COMPANY_UPDATED",          messageKey: "log.company.activeChanged" },
  },
});

export const Company = model("Company", companySchema);
