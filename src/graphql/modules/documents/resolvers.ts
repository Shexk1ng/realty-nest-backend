// Operacje CRUD na dokumentach oraz nazwy wyświetlane dla oferty i osoby, która wgrała plik

import { GraphQLError } from "graphql";
import { Document } from "../../../models/documents.js";
import { Property } from "../../../models/properties.js";
import { makeCrudResolvers } from "../_shared/crud.js";
import { agentBrief, propertyBrief } from "../_shared/briefs.js";

const documentResolversBase = makeCrudResolvers({
  model: Document,
  names: {
    list: "getDocuments",
    byId: "getDocumentById",
    create: "addDocument",
    update: "updateDocument",
    remove: "deleteDocument",
  },
  ownerField: "uploadedById",
  relatedRefs: [{ field: "propertyId", model: Property }],
  immutable: true,
  searchFields: ["name", "originalName"],
  prepareCreate: (fields) => {
    const publicId = fields.publicId;
    if (typeof publicId !== "string" || !publicId.trim()) {
      throw new GraphQLError("A document must have a file attached", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    return fields;
  },
});

export const documentResolvers = {
  ...documentResolversBase,
  Document: {
    propertyTitle: async (r: { propertyId?: string | null }) =>
      (await propertyBrief(r.propertyId))?.title ?? null,
    uploadedByName: async (r: { uploadedById?: string | null }) =>
      (await agentBrief(r.uploadedById))?.name ?? null,
  },
};
