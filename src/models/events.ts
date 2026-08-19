// Schemat wydarzenia w kalendarzu: termin, rodzaj i powiązania z ofertą, kontaktem oraz agentem

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type EventKind = "VIEWING" | "MEETING" | "CALL" | "INSPECTION" | "OTHER";

const calendarEventSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    location: { type: String, default: null },
    kind: {
      type: String,
      enum: ["VIEWING", "MEETING", "CALL", "INSPECTION", "OTHER"],
      default: "MEETING",
    },
    companyId: { type: String, ref: "Company", required: true },
    agentId: { type: String, ref: "User", default: null },
    propertyId: { type: String, ref: "Property", default: null },
    contactId: { type: String, ref: "Contact", default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false, collection: "events" },
);

calendarEventSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("calendarEvent");
});

calendarEventSchema.plugin(activityLogPlugin, {
  entityName: "CalendarEvent",
  category: "CALENDAR",
  prefix: "EVENT",
  i18nBase: "log.event",
  labelField: "title",
  refField: "eventId",
  fieldEvents: {
    startAt:   { type: "EVENT_UPDATED", messageKey: "log.event.rescheduled" },
    isDeleted: { type: "EVENT_DELETED", messageKey: "log.event.deleted" },
  },
});

calendarEventSchema.index({ companyId: 1, startAt: 1 });
calendarEventSchema.index({ companyId: 1, agentId: 1 });

export const CalendarEvent = model("CalendarEvent", calendarEventSchema);
