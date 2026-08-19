// Schemat GraphQL dokumentów przypiętych do ofert

export const documentTypeDefs = `#graphql
  type Document {
    id: ID!
    shortId: Int!
    name: String!
    fileType: String!
    category: String!
    sizeBytes: Float
    url: String
    publicId: String
    resourceType: String
    deliveryType: String
    mimeType: String
    originalName: String
    format: String
    companyId: String!
    uploadedById: String
    propertyId: String
    # Display names for the two ids above, resolved on demand — an id in a table column
    # tells the reader nothing about who filed the document or what it belongs to.
    uploadedByName: String
    propertyTitle: String
    expiresAt: String
    createdAt: String
    updatedAt: String
  }

  type DocumentPage {
    items: [Document!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getDocuments(companyId: String, limit: Int, offset: Int, search: String): DocumentPage!
    getDocumentById(id: ID!): Document
  }

  extend type Mutation {
    addDocument(
      name: String!
      fileType: String
      category: String
      sizeBytes: Float
      url: String
      publicId: String
      resourceType: String
      mimeType: String
      originalName: String
      format: String
      uploadedById: String
      propertyId: String
      expiresAt: String
    ): Document!

    updateDocument(
      id: ID!
      name: String
      fileType: String
      category: String
      sizeBytes: Float
      url: String
      publicId: String
      resourceType: String
      mimeType: String
      originalName: String
      format: String
      uploadedById: String
      propertyId: String
      expiresAt: String
    ): Document

    deleteDocument(id: ID!): Boolean
  }
`;
