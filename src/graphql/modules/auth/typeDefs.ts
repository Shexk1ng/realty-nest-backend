// Schemat GraphQL logowania i weryfikacji drugiego składnika uwierzytelniania

export const authTypeDefs = `#graphql
  type AuthUser {
    id: ID!
    shortId: Int!
    name: String!
    email: String!
    role: String!
    companyId: String
    twoFactorEnabled: Boolean!
  }

  type AuthPayload {
    accessToken: String
    twoFactorRequired: Boolean!
    pendingToken: String
    user: AuthUser!
  }

  extend type Query {
    checkEmail(email: String!): Boolean!
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!

    verifyTwoFactorLogin(pendingToken: String!, code: String!, isBackupCode: Boolean): AuthPayload!
  }
`;
