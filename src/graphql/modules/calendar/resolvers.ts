// Operacje CRUD na wydarzeniach kalendarza oparte na wspólnej fabryce resolwerów

import { CalendarEvent } from "../../../models/events.js";
import { Property } from "../../../models/properties.js";
import { Contact } from "../../../models/contacts.js";
import { makeCrudResolvers } from "../_shared/crud.js";

export const calendarResolvers = makeCrudResolvers({
  model: CalendarEvent,
  names: {
    list: "getEvents",
    create: "addEvent",
    update: "updateEvent",
    remove: "deleteEvent",
  },
  ownerField: "agentId",
  relatedRefs: [
    { field: "propertyId", model: Property },
    { field: "contactId", model: Contact },
  ],
  defaultSort: { startAt: 1 },
});
