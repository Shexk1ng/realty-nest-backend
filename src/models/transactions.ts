// Schemat transakcji sprzedaży lub najmu wraz z listą kontrolną formalności i kwotami

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type TransactionKind = "SALE" | "RENT" | "LEASE";
export type TransactionStatus = "DRAFT" | "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

const transactionSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    kind: {
      type: String,
      enum: ["SALE", "RENT", "LEASE"],
      default: "SALE",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "COMPLETED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },

    price: { type: Number, required: true },
    currency: { type: String, default: "PLN" },
    deposit: { type: Number, default: 0 },

    signedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },

    checklist: {
      type: [
        new Schema(
          {
            key:         { type: String, required: true },
            label:       { type: String, required: true },
            done:        { type: Boolean, default: false },
            completedAt: { type: Date, default: null },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    buyerContactId: { type: String, ref: "Contact", default: null },
    sellerContactId: { type: String, ref: "Contact", default: null },
    buyerName: { type: String, default: null },
    sellerName: { type: String, default: null },

    companyId:  { type: String, ref: "Company",  required: true },
    propertyId: { type: String, ref: "Property", required: true },
    agentId:    { type: String, ref: "User",     default: null },
    offerId:    { type: String, ref: "Offer",    default: null },
    leadId:     { type: String, ref: "PipelineLead", default: null },
    commissionId: { type: String, ref: "Commission", default: null },

    notes: { type: String, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

transactionSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("transaction");
});

transactionSchema.plugin(activityLogPlugin, {
  entityName: "Transaction",
  category: "TRANSACTION",
  prefix: "TRANSACTION",
  i18nBase: "log.transaction",
  labelField: "buyerName",
  refField: "transactionId",
  fieldEvents: {
    status:   { type: "TRANSACTION_STATUS_CHANGED", messageKey: "log.transaction.statusChanged" },
    closedAt: { type: "TRANSACTION_COMPLETED",      messageKey: "log.transaction.completed" },
  },
});

transactionSchema.index({ companyId: 1, createdAt: -1 });
transactionSchema.index({ propertyId: 1 });

export const Transaction = model("Transaction", transactionSchema);
