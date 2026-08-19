// Schemat GraphQL prezentacji nieruchomości

import { RELATED_FIELDS_SDL } from "../_shared/briefs.js";

export const viewingTypeDefs = `#graphql
  type Viewing {
    id: ID!
    shortId: Int!
    scheduledAt: String!
    durationMin: Int!
    status: String!
    outcome: String
    rating: Int
    feedback: String
    followUpAt: String
    companyId: String!
    propertyId: String!
    contactId: String
    agentId: String
    leadId: String
    eventId: String

    # Display names for the referenced records (see _shared/briefs.ts).
${RELATED_FIELDS_SDL}
    createdAt: String
    updatedAt: String
  }

  type ViewingPage {
    items: [Viewing!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getViewings(companyId: String, limit: Int, offset: Int): ViewingPage!
  }

  extend type Mutation {
    addViewing(
      scheduledAt: String!
      durationMin: Int
      status: String
      outcome: String
      rating: Int
      feedback: String
      followUpAt: String
      propertyId: String!
      contactId: String
      agentId: String
      leadId: String
      eventId: String
    ): Viewing!

    updateViewing(
      id: ID!
      scheduledAt: String
      durationMin: Int
      status: String
      outcome: String
      rating: Int
      feedback: String
      followUpAt: String
      # The viewing's listing was settable on create and nowhere else, so correcting a
      # mis-picked offer meant deleting the appointment and booking it again.
      propertyId: String
      contactId: String
      agentId: String
      leadId: String
      eventId: String
    ): Viewing

    deleteViewing(id: ID!): Boolean
  }
`;
