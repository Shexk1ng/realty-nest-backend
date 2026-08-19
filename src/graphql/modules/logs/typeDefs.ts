// Schemat GraphQL dziennika zdarzeń i stanu łańcucha skrótów

export const logTypeDefs = `#graphql
  "A single immutable audit-log entry (part of the tamper-evident hash-chain)."
  type AuditLog {
    id: ID!
    shortId: Int
    seq: Int
    type: String!
    category: String!
    messageKey: String!
    messageParamsJson: String
    fallbackText: String
    actorId: String
    actorName: String
    actorRole: String
    targetType: String
    targetId: String
    companyId: String
    ipAddress: String
    hash: String
    prevHash: String
    chainedAt: String
    createdAt: String
  }

  "Result of recomputing the audit hash-chain end-to-end."
  type AuditChainStatus {
    ok: Boolean!
    total: Int!
    brokenAtSeq: Int
    reason: String
    checkedAt: String!
  }

  type AuditStat {
    key: String!
    count: Int!
  }

  extend type Query {
    "Recent audit-log entries. SYSTEM_ADMIN sees all; COMPANY_ADMIN sees own company."
    getAuditLogs(category: String, actorId: String, limit: Int, offset: Int): [AuditLog!]!
    "Verify the whole hash-chain (SYSTEM_ADMIN only)."
    auditChainStatus: AuditChainStatus!
    "Aggregate counters for the security dashboard."
    auditStats: [AuditStat!]!
  }
`;
