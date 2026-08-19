// Schemat GraphQL kont użytkowników i ich profili

export const userTypeDefs = `#graphql
  type CompanyBrief {
    id: ID!
    name: String!
    logoUrl: String
    coverImageUrl: String
  }

  type UserProfile {
    firstName: String!
    lastName: String!
    fullName: String!
    phone: String
    phoneMobile: String
    avatarUrl: String
    profilePictureUrl: String
    bio: String
    jobTitle: String
    licenseNumber: String
    timezone: String!
    language: String!
  }

  type User {
    id: ID!
    shortId: Int!
    email: String!
    name: String!
    profile: UserProfile!
    role: String!
    companyId: String
    company: CompanyBrief
    # Only meaningful for AGENT_ASSISTANT: the agent whose records this account works on.
    assignedAgentId: String
    isActive: Boolean!
    deactivatedAt: String
    twoFactorEnabled: Boolean!
    lastLoginAt: String
    createdAt: String
  }

  input UserProfileInput {
    firstName: String
    lastName: String
    phone: String
    phoneMobile: String
    avatarUrl: String
    profilePictureUrl: String
    bio: String
    jobTitle: String
    licenseNumber: String
    timezone: String
    language: String
  }

  type UserPage {
    items: [User!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getUsers(companyId: String, limit: Int, offset: Int): UserPage!
    getUserById(id: ID!): User
    me: User
  }

  extend type Mutation {
    createUser(
      email: String!
      password: String!
      name: String!
      role: String!
      companyId: String
      profile: UserProfileInput
      assignedAgentId: String
    ): User!

    updateUser(id: ID!, name: String, role: String, isActive: Boolean, assignedAgentId: String): User
    updateProfile(id: ID!, profile: UserProfileInput!): User
    changePassword(id: ID!, currentPassword: String!, newPassword: String!): Boolean!
    deactivateUser(id: ID!): User
  }
`;
