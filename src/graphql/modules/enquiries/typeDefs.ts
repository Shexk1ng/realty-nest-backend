// Schemat GraphQL zapytań klientów, w tym zgłoszeń z formularza publicznego

export const enquiryTypeDefs = `#graphql
  type Enquiry {
    id: ID!
    shortId: Int!
    name: String!
    email: String
    phone: String
    propertyInterest: String
    location: String
    budget: Float
    note: String
    source: String!
    priority: String!
    status: String!
    companyId: String!
    agentId: String
    propertyId: String
    consentGivenAt: String
    createdAt: String
    updatedAt: String
  }

  type EnquiryPage {
    items: [Enquiry!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getEnquiries(companyId: String, limit: Int, offset: Int, search: String): EnquiryPage!
    getEnquiryById(id: ID!): Enquiry
  }

  extend type Mutation {
    submitPublicEnquiry(
      firstName: String!
      lastName: String!
      phone: String!
      companyId: String!
      propertyInterest: String
      note: String
      "Whether the visitor ticked the consent-to-contact checkbox."
      consent: Boolean
    ): Boolean!

    addEnquiry(
      name: String!
      email: String
      "Optional: the public contact form does not always collect a phone number."
      phone: String
      propertyInterest: String
      location: String
      budget: Float
      note: String
      source: String
      priority: String
      status: String
      agentId: String
      propertyId: String
    ): Enquiry!

    updateEnquiry(
      id: ID!
      name: String
      email: String
      phone: String
      propertyInterest: String
      location: String
      budget: Float
      note: String
      source: String
      priority: String
      status: String
      agentId: String
      propertyId: String
    ): Enquiry

    deleteEnquiry(id: ID!): Boolean
  }
`;
