// Schemat GraphQL kontaktów wraz z operacjami RODO na danych osobowych

export const contactTypeDefs = `#graphql
  type Contact {
    id: ID!
    shortId: Int!
    name: String!
    email: String
    phone: String
    role: String
    notes: String
    kind: String!
    source: String
    companyId: String!
    ownerId: String
    consentGivenAt: String
    createdAt: String
    updatedAt: String
  }

  type ContactPage {
    items: [Contact!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getContacts(companyId: String, limit: Int, offset: Int, search: String): ContactPage!
    """
    RODO art. 15/20 — the contact's complete record together with the enquiries
    linked to it, serialised as JSON for handover to the data subject.
    """
    exportContactData(id: ID!): String!
  }

  extend type Mutation {
    addContact(
      name: String!
      email: String
      phone: String
      role: String
      notes: String
      kind: String
      source: String
      ownerId: String
      consent: Boolean
    ): Contact!

    updateContact(
      id: ID!
      name: String
      email: String
      phone: String
      role: String
      notes: String
      kind: String
      source: String
      ownerId: String
      consent: Boolean
    ): Contact

    deleteContact(id: ID!): Boolean
    """
    RODO art. 17 — irreversible erasure. Unlike deleteContact (a reversible soft
    delete) this removes the record permanently; the audit entry documenting the
    erasure deliberately carries no personal data.
    """
    hardDeleteContact(id: ID!): Boolean!
  }
`;
