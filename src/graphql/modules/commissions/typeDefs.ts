// Schemat GraphQL prowizji wraz z zestawieniem zbiorczym

import { RELATED_FIELDS_SDL } from "../_shared/briefs.js";

export const commissionTypeDefs = `#graphql
  type Commission {
    id: ID!
    shortId: Int!
    salePrice: Float!
    rate: Float!
    amount: Float!
    status: String!
    dealDate: String!
    paidDate: String
    clientName: String
    invoiceNumber: String
    companyId: String!
    agentId: String
    propertyId: String

    # Display names for the referenced records (see _shared/briefs.ts).
${RELATED_FIELDS_SDL}
    createdAt: String
    updatedAt: String
  }

  type CommissionPage {
    items: [Commission!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  "Aggregated commission flow for the caller's visible scope."
  type CommissionSummary {
    count: Int!
    totalSalePrice: Float!
    totalAmount: Float!
    paidAmount: Float!
    pendingAmount: Float!
    processingAmount: Float!
    disputedAmount: Float!
  }

  extend type Query {
    getCommissions(companyId: String, limit: Int, offset: Int): CommissionPage!
    getCommissionSummary: CommissionSummary!
  }

  extend type Mutation {
    addCommission(
      salePrice: Float!
      rate: Float!
      "Ignored — the server always recomputes amount = salePrice × rate / 100."
      amount: Float
      status: String
      dealDate: String!
      paidDate: String
      clientName: String
      invoiceNumber: String
      agentId: String
      propertyId: String
    ): Commission!

    updateCommission(
      id: ID!
      salePrice: Float
      rate: Float
      "Ignored — the server always recomputes amount = salePrice × rate / 100."
      amount: Float
      status: String
      dealDate: String
      paidDate: String
      clientName: String
      invoiceNumber: String
      agentId: String
      propertyId: String
    ): Commission

    deleteCommission(id: ID!): Boolean
  }
`;
