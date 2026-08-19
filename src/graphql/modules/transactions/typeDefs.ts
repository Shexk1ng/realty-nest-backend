// Schemat GraphQL transakcji i ich listy kontrolnej

import { RELATED_FIELDS_SDL } from "../_shared/briefs.js";

export const transactionTypeDefs = `#graphql
  "One formal step in closing a transaction (legal, financial or documentary)."
  type TransactionChecklistItem {
    key: String!
    label: String!
    done: Boolean!
    completedAt: String
  }

  input TransactionChecklistItemInput {
    key: String!
    label: String!
    done: Boolean
    completedAt: String
  }

  type Transaction {
    id: ID!
    shortId: Int!
    kind: String!
    status: String!
    price: Float!
    currency: String!
    deposit: Float!
    signedAt: String
    closedAt: String
    buyerContactId: String
    sellerContactId: String
    buyerName: String
    sellerName: String
    companyId: String!
    propertyId: String!
    agentId: String
    offerId: String
    leadId: String
    commissionId: String

    # Display names for the referenced records (see _shared/briefs.ts).
${RELATED_FIELDS_SDL}
    checklist: [TransactionChecklistItem!]!
    notes: String
    createdAt: String
    updatedAt: String
  }

  type TransactionPage {
    items: [Transaction!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getTransactions(companyId: String, limit: Int, offset: Int): TransactionPage!
  }

  extend type Mutation {
    addTransaction(
      kind: String
      status: String
      price: Float!
      currency: String
      deposit: Float
      signedAt: String
      closedAt: String
      buyerContactId: String
      sellerContactId: String
      buyerName: String
      sellerName: String
      propertyId: String!
      agentId: String
      offerId: String
      leadId: String
      commissionId: String
      notes: String
      checklist: [TransactionChecklistItemInput!]
    ): Transaction!

    updateTransaction(
      id: ID!
      kind: String
      status: String
      price: Float
      currency: String
      deposit: Float
      signedAt: String
      closedAt: String
      buyerContactId: String
      sellerContactId: String
      buyerName: String
      sellerName: String
      agentId: String
      offerId: String
      leadId: String
      commissionId: String
      notes: String
      checklist: [TransactionChecklistItemInput!]
    ): Transaction

    deleteTransaction(id: ID!): Boolean
  }
`;
