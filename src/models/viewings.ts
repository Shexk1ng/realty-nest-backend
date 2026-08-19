// Schemat prezentacji nieruchomości: termin, status, wynik spotkania i ocena od klienta

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type ViewingStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED" | "RESCHEDULED";
export type ViewingOutcome = "INTERESTED" | "NOT_INTERESTED" | "OFFER_MADE" | "FOLLOW_UP" | "UNDECIDED" | null;

const viewingSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    scheduledAt: { type: Date, required: true },
    durationMin: { type: Number, default: 30 },

    status: {
      type: String,
      enum: ["SCHEDULED", "CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED", "RESCHEDULED"],
      default: "SCHEDULED",
    },

    outcome: {
      type: String,
      enum: ["INTERESTED", "NOT_INTERESTED", "OFFER_MADE", "FOLLOW_UP", "UNDECIDED"],
      default: null,
    },
    rating:   { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: null },
    followUpAt: { type: Date, default: null },

    companyId:  { type: String, ref: "Company",       required: true },
    propertyId: { type: String, ref: "Property",      required: true },
    contactId:  { type: String, ref: "Contact",       default: null },
    agentId:    { type: String, ref: "User",          default: null },
    leadId:     { type: String, ref: "PipelineLead",  default: null },
    eventId:    { type: String, ref: "CalendarEvent", default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

viewingSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("viewing");
});

viewingSchema.plugin(activityLogPlugin, {
  entityName: "Viewing",
  category: "VIEWING",
  prefix: "VIEWING",
  i18nBase: "log.viewing",
  refField: "viewingId",
  fieldEvents: {
    status:      { type: "VIEWING_STATUS_CHANGED",   messageKey: "log.viewing.statusChanged" },
    outcome:     { type: "VIEWING_OUTCOME_LOGGED",   messageKey: "log.viewing.outcomeLogged" },
    scheduledAt: { type: "VIEWING_RESCHEDULED",      messageKey: "log.viewing.rescheduled" },
  },
});

viewingSchema.index({ companyId: 1, scheduledAt: -1 });
viewingSchema.index({ propertyId: 1 });

export const Viewing = model("Viewing", viewingSchema);
