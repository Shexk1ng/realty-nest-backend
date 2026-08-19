// Operacje CRUD na prezentacjach nieruchomości wraz z nazwami powiązanych rekordów

import { Viewing } from "../../../models/viewings.js";
import { Property } from "../../../models/properties.js";
import { Contact } from "../../../models/contacts.js";
import { makeCrudResolvers } from "../_shared/crud.js";
import { relatedFieldResolvers } from "../_shared/briefs.js";

const viewingResolversBase = makeCrudResolvers({
  model: Viewing,
  names: {
    list: "getViewings",
    create: "addViewing",
    update: "updateViewing",
    remove: "deleteViewing",
  },
  ownerField: "agentId",
  relatedRefs: [
    { field: "propertyId", model: Property },
    { field: "contactId", model: Contact },
  ],
  defaultSort: { scheduledAt: -1 },
});

export const viewingResolvers = {
  ...viewingResolversBase,
  Viewing: relatedFieldResolvers,
};
