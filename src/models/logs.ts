// Schemat wpisu dziennika zdarzeń, nadający numer sekwencji i haszujący wpis w łańcuchu pod blokadą

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { computeLogHash, GENESIS_HASH, type ChainableEntry } from "../utils/auditChain.js";

export type LogCategory =
  | "PROPERTY"
  | "CONTACT"
  | "ENQUIRY"
  | "PIPELINE"
  | "COMMISSION"
  | "DOCUMENT"
  | "CAMPAIGN"
  | "CALENDAR"
  | "USER"
  | "COMPANY"
  | "AUTH"
  | "SYSTEM"
  | "TRANSACTION"
  | "VIEWING"
  | "TASK"
  | "PROPSHARE";

export type LogType =
  | "PROPERTY_CREATED" | "PROPERTY_UPDATED" | "PROPERTY_DELETED"
  | "PROPERTY_STATUS_CHANGED" | "PROPERTY_ASSIGNED" | "PROPERTY_PRICE_CHANGED"
  | "CONTACT_CREATED" | "CONTACT_UPDATED" | "CONTACT_DELETED"
  | "CONTACT_DATA_EXPORTED" | "CONTACT_HARD_DELETED"
  | "ENQUIRY_CREATED" | "ENQUIRY_UPDATED" | "ENQUIRY_DELETED"
  | "ENQUIRY_STATUS_CHANGED" | "ENQUIRY_ASSIGNED"
  | "LEAD_CREATED" | "LEAD_UPDATED" | "LEAD_DELETED"
  | "LEAD_STAGE_CHANGED" | "LEAD_WON" | "LEAD_LOST"
  | "COMMISSION_CREATED" | "COMMISSION_UPDATED" | "COMMISSION_DELETED"
  | "COMMISSION_PAID" | "COMMISSION_DISPUTED"
  | "DOCUMENT_UPLOADED" | "DOCUMENT_UPDATED" | "DOCUMENT_DELETED"
  | "DOCUMENT_DOWNLOADED"
  | "CAMPAIGN_CREATED" | "CAMPAIGN_UPDATED" | "CAMPAIGN_DELETED"
  | "CAMPAIGN_STARTED" | "CAMPAIGN_PAUSED" | "CAMPAIGN_ENDED"
  | "EVENT_CREATED" | "EVENT_UPDATED" | "EVENT_DELETED" | "EVENT_CANCELLED"
  | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED"
  | "USER_ROLE_CHANGED" | "USER_DEACTIVATED" | "USER_REACTIVATED"
  | "USER_PROFILE_UPDATED"
  | "COMPANY_CREATED" | "COMPANY_UPDATED" | "COMPANY_SETTINGS_UPDATED"
  | "AUTH_LOGIN" | "AUTH_LOGIN_FAILED" | "AUTH_LOGOUT"
  | "AUTH_PASSWORD_CHANGED" | "AUTH_PASSWORD_RESET"
  | "AUTH_2FA_ENABLED" | "AUTH_2FA_DISABLED" | "AUTH_2FA_FAILED"
  | "TRANSACTION_CREATED" | "TRANSACTION_UPDATED" | "TRANSACTION_DELETED"
  | "TRANSACTION_STATUS_CHANGED" | "TRANSACTION_COMPLETED" | "TRANSACTION_CANCELLED"
  | "VIEWING_CREATED" | "VIEWING_UPDATED" | "VIEWING_DELETED"
  | "VIEWING_STATUS_CHANGED" | "VIEWING_OUTCOME_LOGGED" | "VIEWING_RESCHEDULED"
  | "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED"
  | "TASK_STATUS_CHANGED" | "TASK_ASSIGNED" | "TASK_DUE_CHANGED"
  | "PROPSHARE_CREATED" | "PROPSHARE_UPDATED" | "PROPSHARE_DELETED"
  | "PROPSHARE_STATUS_CHANGED"
  | "SYSTEM_NOTE";

export type LogTargetType =
  | "Property" | "Contact" | "Enquiry" | "PipelineLead"
  | "Commission" | "Document" | "Campaign" | "CalendarEvent"
  | "User" | "Company"
  | "Transaction" | "Viewing" | "Task"
  | "PropShareOffer"
  | "None";

const LOG_CATEGORIES: LogCategory[] = [
  "PROPERTY", "CONTACT", "ENQUIRY", "PIPELINE", "COMMISSION",
  "DOCUMENT", "CAMPAIGN", "CALENDAR", "USER", "COMPANY", "AUTH", "SYSTEM",
  "TRANSACTION", "VIEWING", "TASK", "PROPSHARE",
];

const LOG_TARGET_TYPES: LogTargetType[] = [
  "Property", "Contact", "Enquiry", "PipelineLead", "Commission",
  "Document", "Campaign", "CalendarEvent", "User", "Company",
  "Transaction", "Viewing", "Task", "PropShareOffer",
  "None",
];

const activityLogSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    type:     { type: String, required: true },
    category: { type: String, required: true, enum: LOG_CATEGORIES },

    messageKey:    { type: String, required: true },
    messageParams: { type: Schema.Types.Mixed, default: {} },

    fallbackText:  { type: String, default: null },

    actorId:      { type: String, ref: "User", default: null },
    actorShortId: { type: Number, default: null },
    actorName:    { type: String, default: null },
    actorRole:    { type: String, default: null },

    targetType:     { type: String, enum: LOG_TARGET_TYPES, default: "None" },
    targetId:       { type: String, default: null },
    targetShortId:  { type: Number, default: null },

    propertyId:      { type: String, ref: "Property",      default: null },
    propertyShortId: { type: Number, default: null },
    contactId:       { type: String, ref: "Contact",       default: null },
    contactShortId:  { type: Number, default: null },
    enquiryId:       { type: String, ref: "Enquiry",       default: null },
    enquiryShortId:  { type: Number, default: null },
    leadId:          { type: String, ref: "PipelineLead",  default: null },
    leadShortId:     { type: Number, default: null },
    commissionId:    { type: String, ref: "Commission",    default: null },
    commissionShortId:{ type: Number, default: null },
    documentId:      { type: String, ref: "Document",      default: null },
    documentShortId: { type: Number, default: null },
    campaignId:      { type: String, ref: "Campaign",      default: null },
    campaignShortId: { type: Number, default: null },
    eventId:         { type: String, ref: "CalendarEvent", default: null },
    eventShortId:    { type: Number, default: null },
    userId:          { type: String, ref: "User",          default: null },
    userShortId:     { type: Number, default: null },
    transactionId:   { type: String, ref: "Transaction",   default: null },
    transactionShortId: { type: Number, default: null },
    offerId:         { type: String, ref: "Offer",         default: null },
    offerShortId:    { type: Number, default: null },
    viewingId:       { type: String, ref: "Viewing",       default: null },
    viewingShortId:  { type: Number, default: null },
    taskId:          { type: String, ref: "Task",          default: null },
    taskShortId:     { type: Number, default: null },
    propShareOfferId:      { type: String, ref: "PropShareOffer", default: null },
    propShareOfferShortId: { type: Number, default: null },

    companyId: { type: String, ref: "Company", default: null },

    changes: { type: Schema.Types.Mixed, default: null },

    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },

    seq:       { type: Number, default: null },
    prevHash:  { type: String, default: null },
    hash:      { type: String, default: null },
    chainedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false, collection: "logs" },
);

/**
 * Blokada łańcucha skrótów. Numer `seq` powstaje z odczytu „ostatni wpis + 1", więc
 * blokada MUSI obejmować także sam zapis wpisu do bazy, a nie tylko wyliczenie numeru:
 * dopóki poprzedni wpis nie jest w kolekcji, kolejny odczyta ten sam ostatni numer
 * i oba dostaną to samo `seq` (E11000 na indeksie seq_1). Dlatego blokadę zajmuje
 * hak pre("save"), a zwalnia ją dopiero post("save") — po udanym albo nieudanym zapisie.
 *
 * Bezpiecznik czasowy: gdyby zapis przerwał się tak, że żaden hak post nie wystartował,
 * blokada zwolni się sama po CHAIN_LOCK_TIMEOUT_MS. Lepiej dopuścić teoretyczne
 * zderzenie numerów niż zawiesić dziennik całej aplikacji na stałe.
 */
const CHAIN_LOCK_TIMEOUT_MS = 15_000;

let chainLock: Promise<unknown> = Promise.resolve();

function acquireChainLock(): Promise<() => void> {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      console.error("[ActivityLog] blokada łańcucha zwolniona po przekroczeniu czasu");
      resolve();
    }, CHAIN_LOCK_TIMEOUT_MS);
    if (typeof timer.unref === "function") timer.unref();
    release = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
  });

  const previous = chainLock;
  chainLock = previous.then(() => held, () => held);
  return previous.then(() => release, () => release);
}

/** Zwalnia blokadę trzymaną przez dokument; wywołanie powtórne nic nie robi. */
function releaseChainLock(doc: any): void {
  const release = doc?.$locals?.chainRelease;
  if (typeof release !== "function") return;
  doc.$locals.chainRelease = null;
  release();
}

activityLogSchema.pre("save", async function (this: any) {
  if (!this.isNew) return;
  this.shortId = await nextSeq("activityLog");

  this.$locals = this.$locals ?? {};
  this.$locals.chainRelease = await acquireChainLock();

  try {
    const Model = this.constructor as typeof ActivityLog;
    const last = (await Model.findOne({}).sort({ seq: -1 }).select("seq hash").lean()) as
      | { seq?: number; hash?: string }
      | null;
    const seq = (last?.seq ?? 0) + 1;
    const prevHash = last?.hash ?? GENESIS_HASH;
    const chainedAt = new Date();

    const entry: ChainableEntry = {
      seq,
      type: this.type as string,
      category: this.category as string,
      actorId: (this.actorId as string) ?? null,
      actorRole: (this.actorRole as string) ?? null,
      targetType: (this.targetType as string) ?? null,
      targetId: (this.targetId as string) ?? null,
      companyId: (this.companyId as string) ?? null,
      messageKey: this.messageKey as string,
      messageParams: this.messageParams ?? null,
      changes: this.changes ?? null,
      chainedAt: chainedAt.toISOString(),
    };

    this.seq = seq;
    this.prevHash = prevHash;
    this.chainedAt = chainedAt;
    this.hash = computeLogHash(entry, prevHash);
  } catch (err) {
    releaseChainLock(this);
    throw err;
  }
});

// Blokadę zwalniamy dopiero tutaj — wpis jest już w kolekcji, więc następny
// odczyta jego seq i hash. Druga wersja haka (z parametrem błędu) łapie zapis
// nieudany, żeby awaria jednego wpisu nie zatrzymała dziennika.
activityLogSchema.post("save", function (this: any, doc: any) {
  releaseChainLock(doc ?? this);
});

activityLogSchema.post("save", function (this: any, err: any, doc: any, next: any) {
  releaseChainLock(doc ?? this);
  next(err);
});

activityLogSchema.index({ companyId: 1, createdAt: -1 });
activityLogSchema.index({ propertyId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ actorId: 1, createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ seq: 1 }, { unique: true, sparse: true });

export const ActivityLog = model("ActivityLog", activityLogSchema);
