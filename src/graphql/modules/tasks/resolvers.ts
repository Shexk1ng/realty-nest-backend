// Operacje CRUD na zadaniach z zapisem autora zadania

import { Task } from "../../../models/tasks.js";
import { Property } from "../../../models/properties.js";
import { Contact } from "../../../models/contacts.js";
import { makeCrudResolvers } from "../_shared/crud.js";
import type { TokenPayload } from "../../../utils/jwt.js";

function withCreatedBy(fields: Record<string, unknown>, caller: TokenPayload): Record<string, unknown> {
  return { ...fields, createdById: caller.sub };
}

export const taskResolvers = makeCrudResolvers({
  model: Task,
  names: {
    list: "getTasks",
    create: "addTask",
    update: "updateTask",
    remove: "deleteTask",
  },
  ownerField: "assigneeId",
  relatedRefs: [
    { field: "propertyId", model: Property },
    { field: "contactId", model: Contact },
  ],
  defaultSort: { dueAt: 1 },
  prepareCreate: withCreatedBy,
});
