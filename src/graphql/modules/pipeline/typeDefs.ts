// Schemat GraphQL szans sprzedaży w lejku

import { RELATED_FIELDS_SDL } from "../_shared/briefs.js";

export const pipelineTypeDefs = `#graphql
  type PipelineLead {
    id: ID!
    shortId: Int!
    title: String!
    stage: String!
    source: String
    estValue: Float
    companyId: String!
    agentId: String
    contactId: String
    propertyId: String
    enquiryId: String

    # Display names for the referenced records (see _shared/briefs.ts).
${RELATED_FIELDS_SDL}
    enquiryName: String

    createdAt: String
    updatedAt: String
  }

  type PipelineLeadPage {
    items: [PipelineLead!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getLeads(companyId: String, limit: Int, offset: Int): PipelineLeadPage!
  }

  extend type Mutation {
    addLead(
      title: String!
      stage: String
      source: String
      estValue: Float
      agentId: String
      contactId: String
      propertyId: String
      enquiryId: String
    ): PipelineLead!

    updateLead(
      id: ID!
      title: String
      stage: String
      source: String
      estValue: Float
      agentId: String
      contactId: String
      propertyId: String
      enquiryId: String
    ): PipelineLead

    deleteLead(id: ID!): Boolean
  }
`;
