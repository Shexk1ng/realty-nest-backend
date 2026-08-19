// Schemat GraphQL kopii zapasowych bazy danych

export const backupTypeDefs = `#graphql
  type Backup {
    id: ID!
    shortId: Int!
    publicId: String
    status: String!
    errorMessage: String
    sizeBytes: Int!
    collectionsCount: Int!
    docCount: Int!
    createdById: String
    createdByName: String
    createdAt: String
  }

  extend type Query {
    getBackups: [Backup!]!
    getBackupById(id: ID!): Backup
    """
    Serialises every collection to a JSON document. Restricted to the platform
    administrator: the result deliberately crosses tenant boundaries.
    """
    dumpDatabase: String!
  }

  extend type Mutation {
    recordBackup(
      publicId: String
      sizeBytes: Int!
      collectionsCount: Int!
      docCount: Int!
      status: String
      errorMessage: String
    ): Backup!
  }
`;
