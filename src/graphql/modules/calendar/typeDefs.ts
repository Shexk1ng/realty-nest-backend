// Schemat GraphQL wydarzeń kalendarza

export const calendarTypeDefs = `#graphql
  type CalendarEvent {
    id: ID!
    shortId: Int!
    title: String!
    description: String
    startAt: String!
    endAt: String!
    location: String
    kind: String!
    companyId: String!
    agentId: String
    propertyId: String
    contactId: String
    createdAt: String
    updatedAt: String
  }

  type CalendarEventPage {
    items: [CalendarEvent!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getEvents(companyId: String, limit: Int, offset: Int): CalendarEventPage!
  }

  extend type Mutation {
    addEvent(
      title: String!
      description: String
      startAt: String!
      endAt: String!
      location: String
      kind: String
      agentId: String
      propertyId: String
      contactId: String
    ): CalendarEvent!

    updateEvent(
      id: ID!
      title: String
      description: String
      startAt: String
      endAt: String
      location: String
      kind: String
      agentId: String
      propertyId: String
      contactId: String
    ): CalendarEvent

    deleteEvent(id: ID!): Boolean
  }
`;
