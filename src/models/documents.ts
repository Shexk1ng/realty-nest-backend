// Schemat dokumentu w bazie; mimeType jest enumem, bo trasa pobierania zwraca go jako Content-Type

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type DocFileType = "PDF" | "DOCX" | "XLSX" | "IMG" | "VIDEO" | "OTHER";
export type DocCategory = "CONTRACT" | "LISTING" | "REPORT" | "MARKETING" | "LEGAL" | "OTHER";

const documentSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    name: { type: String, required: true },
    fileType: {
      type: String,
      enum: ["PDF", "DOCX", "XLSX", "IMG", "VIDEO", "OTHER"],
      default: "OTHER",
    },
    category: {
      type: String,
      enum: ["CONTRACT", "LISTING", "REPORT", "MARKETING", "LEGAL", "OTHER"],
      default: "OTHER",
    },
    sizeBytes: { type: Number, default: 0 },
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    resourceType: { type: String, enum: ["image", "raw", "video"], default: "raw" },
    deliveryType: { type: String, enum: ["upload", "authenticated"], default: "authenticated" },

    mimeType: {
      type: String,
      enum: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/csv",
        "text/plain",
        "application/zip",
        "application/json",
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
        null,
      ],
      default: null,
    },
    originalName: { type: String, default: null },
    format: { type: String, default: null },
    companyId: { type: String, ref: "Company", required: true },
    uploadedById: { type: String, ref: "User", default: null },
    propertyId: { type: String, ref: "Property", default: null },

    expiresAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

documentSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("document");
});

documentSchema.plugin(activityLogPlugin, {
  entityName: "Document",
  category: "DOCUMENT",
  prefix: "DOCUMENT",
  i18nBase: "log.document",
  labelField: "name",
  refField: "documentId",
  fieldEvents: {
    isDeleted: { type: "DOCUMENT_DELETED", messageKey: "log.document.deleted" },
  },
});

documentSchema.index({ companyId: 1, createdAt: -1 });
documentSchema.index({ companyId: 1, uploadedById: 1 });
documentSchema.index({ propertyId: 1 });

export const Document = model("Document", documentSchema);
