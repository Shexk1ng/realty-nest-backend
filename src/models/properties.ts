// Schemat oferty nieruchomości: parametry, adres, media, cena za metr i indeks pełnotekstowy

import { Schema, model, type Model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type PropertyStatus = "ACTIVE" | "PENDING" | "SOLD" | "WITHDRAWN";
export type TransactionType = "SALE" | "RENT";
export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "STUDIO"
  | "PLOT"
  | "COMMERCIAL"
  | "OFFICE"
  | "GARAGE"
  | "ROOM";
export type MarketType = "PRIMARY" | "SECONDARY";
export type OwnershipType =
  | "FULL_OWNERSHIP"
  | "COOPERATIVE"
  | "COOPERATIVE_LAND"
  | "SHARE";
export type PropertyCondition =
  | "READY_TO_MOVE"
  | "GOOD"
  | "AFTER_RENOVATION"
  | "TO_RENOVATE"
  | "FOR_FINISHING"
  | "DEVELOPER_STATE";

const addressSchema = new Schema(
  {
    street: { type: String, default: null },
    district: { type: String, default: null },
    city: { type: String, default: null },
    postalCode: { type: String, default: null },
    country: { type: String, default: "PL" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false },
);

const descriptionSectionsSchema = new Schema(
  {
    intro: { type: String, default: null },
    layout: { type: String, default: null },
    location: { type: String, default: null },
    additional: { type: String, default: null },
  },
  { _id: false },
);

const propertySchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    title: { type: String, required: true },
    price: { type: Schema.Types.Decimal128, required: true },
    location: { type: String, required: true },

    description: { type: String },
    descriptionSections: { type: descriptionSectionsSchema, default: () => ({}) },

    transactionType: { type: String, enum: ["SALE", "RENT"], default: "SALE" },
    propertyType: {
      type: String,
      enum: ["APARTMENT", "HOUSE", "STUDIO", "PLOT", "COMMERCIAL", "OFFICE", "GARAGE", "ROOM"],
      default: "APARTMENT",
    },
    market: { type: String, enum: ["PRIMARY", "SECONDARY"], default: "SECONDARY" },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "SOLD", "WITHDRAWN"],
      default: "ACTIVE",
    },

    area: { type: Number, default: null },
    plotArea: { type: Number, default: null },
    rooms: { type: Number, default: null },
    bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: null },
    floor: { type: Number, default: null },
    totalFloors: { type: Number, default: null },
    yearBuilt: { type: Number, default: null },

    monthlyRent: { type: Schema.Types.Decimal128, default: null },
    deposit: { type: Schema.Types.Decimal128, default: null },

    ownership: {
      type: String,
      enum: ["FULL_OWNERSHIP", "COOPERATIVE", "COOPERATIVE_LAND", "SHARE"],
      default: null,
    },
    condition: {
      type: String,
      enum: ["READY_TO_MOVE", "GOOD", "AFTER_RENOVATION", "TO_RENOVATE", "FOR_FINISHING", "DEVELOPER_STATE"],
      default: null,
    },
    heating: { type: String, default: null },
    energyClass: { type: String, default: null },
    availableFrom: { type: Date, default: null },

    features: { type: [String], default: [] },

    address: { type: addressSchema, default: () => ({}) },

    imageUrl: { type: String },
    images: { type: [String], default: [] },
    virtualTourUrl: { type: String, default: null },
    floorPlanUrl: { type: String, default: null },

    energyCertificateUrl: { type: String, default: null },

    companyId: { type: String, ref: "Company", required: true },
    agentId: { type: String, ref: "User", default: null },

    propShareListed:   { type: Boolean, default: false },
    propShareListedAt: { type: Date, default: null },
    propShareNotes:    { type: String, default: null },

    contentApprovedAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

propertySchema.virtual("pricePerM2").get(function () {
  const price = this.price == null ? null : parseFloat(this.price.toString());
  if (!price || !this.area) return null;
  return Math.round(price / this.area);
});

propertySchema.pre("save", async function () {
  if (this.isNew) {
    this.shortId = await nextSeq("property");
  }
  if (!this.imageUrl && this.images?.[0]) this.imageUrl = this.images[0];
});

propertySchema.plugin(activityLogPlugin, {
  entityName: "Property",
  category: "PROPERTY",
  prefix: "PROPERTY",
  i18nBase: "log.property",
  labelField: "title",
  refField: "propertyId",
  fieldEvents: {
    status:    { type: "PROPERTY_STATUS_CHANGED", messageKey: "log.property.statusChanged" },
    price:     { type: "PROPERTY_PRICE_CHANGED",  messageKey: "log.property.priceChanged" },
    agentId:   { type: "PROPERTY_ASSIGNED",        messageKey: "log.property.assigned" },
    isDeleted: { type: "PROPERTY_DELETED",         messageKey: "log.property.deleted" },
  },
});

propertySchema.index({ companyId: 1, createdAt: -1 });
propertySchema.index({ companyId: 1, agentId: 1 });
propertySchema.index({ companyId: 1, status: 1 });
propertySchema.index({ propShareListed: 1, status: 1 });

propertySchema.index(
  {
    title: "text",
    location: "text",
    description: "text",
    "descriptionSections.intro": "text",
    "descriptionSections.layout": "text",
    "descriptionSections.location": "text",
    "descriptionSections.additional": "text",
  },
  {
    weights: { title: 10, location: 5, description: 1, "descriptionSections.intro": 1 },
    name: "PropertyTextIndex",
  },
);

export const Property: Model<any> = model("Property", propertySchema);
