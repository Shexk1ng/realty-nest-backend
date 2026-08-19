// Schemat GraphQL wymiany ofert między agencjami

export const propshareTypeDefs = `#graphql
  # Identity of the listing's owner, surfaced on PropShare cards.
  #
  # This is the controlled, deliberate part of the tenant-isolation breach the
  # module is built around: to negotiate a commission split you must know which
  # agency and which agent you are dealing with. Nothing else about the other
  # company is exposed, and these fields are only ever read for properties the
  # caller can already fetch. (A description string cannot precede a type
  # extension in SDL, hence comments rather than a docstring.)
  extend type Property {
    ownerCompanyName: String
    ownerCompanyLogoUrl: String
    ownerAgentName: String
    ownerAgentAvatarUrl: String
    # How many PropShare requests this listing has drawn. Null for a reader outside
    # the owning company: the listing itself is shared on purpose, the demand for it
    # is not, and a rival agency reading the number could price against it.
    propShareOfferCount: Int
  }

  type PropShareOffer {
    id: ID!
    shortId: Int!
    propertyId: String!
    property: Property
    fromAgentId: String!
    fromCompanyId: String!
    toAgentId: String!
    toCompanyId: String!
    # Both sides by name. The property's owner is only ever the receiving
    # side, so a card that labelled the counterparty from the listing showed
    # the reader their own agency on every incoming request.
    fromAgentName: String
    fromAgentAvatarUrl: String
    fromCompanyName: String
    toAgentName: String
    toAgentAvatarUrl: String
    toCompanyName: String
    enquiryId: String
    status: String!
    message: String
    proposedCommission: Float
    viewedAt: String
    respondedAt: String
    createdAt: String
    updatedAt: String
  }

  type AllocationAgent {
    agentId: String!
    name: String!
    avatarUrl: String
    role: String!
    allocationEnabled: Boolean!
    allocationQueueOrder: Int
    lastAllocatedAt: String
  }

  extend type Query {
    getPropShareListings: [Property!]!
    getPropShareOffers: [PropShareOffer!]!
    getAllocationQueue: [AllocationAgent!]!
  }

  extend type Mutation {
    togglePropShare(propertyId: ID!, listed: Boolean!, notes: String): Property!
    sendPropShareOffer(
      propertyId: ID!
      enquiryId: ID
      message: String
      proposedCommission: Float
    ): PropShareOffer!
    updatePropShareOffer(offerId: ID!, status: String!): PropShareOffer!
    updateAllocationSettings(agentId: ID!, enabled: Boolean, queueOrder: Int): Boolean!
  }
`;
