// Schemat GraphQL kampanii marketingowych

export const marketingTypeDefs = `#graphql
  type Campaign {
    id: ID!
    shortId: Int!
    name: String!
    channel: String!
    status: String!
    budget: Float
    spent: Float
    impressions: Int
    clicks: Int
    leads: Int
    startDate: String!
    endDate: String
    companyId: String!
    ownerId: String
    propertyId: String
    "Enquiry that prompted the campaign, when it was launched in response to one."
    enquiryId: String
    enquiryName: String
    createdAt: String
    updatedAt: String
  }

  type CampaignPage {
    items: [Campaign!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getCampaigns(companyId: String, limit: Int, offset: Int): CampaignPage!
  }

  extend type Mutation {
    addCampaign(
      name: String!
      channel: String
      status: String
      budget: Float
      spent: Float
      impressions: Int
      clicks: Int
      leads: Int
      startDate: String!
      endDate: String
      ownerId: String
      propertyId: String
      enquiryId: String
    ): Campaign!

    updateCampaign(
      id: ID!
      name: String
      channel: String
      status: String
      budget: Float
      spent: Float
      impressions: Int
      clicks: Int
      leads: Int
      startDate: String
      endDate: String
      ownerId: String
      propertyId: String
      enquiryId: String
    ): Campaign

    deleteCampaign(id: ID!): Boolean
  }
`;
