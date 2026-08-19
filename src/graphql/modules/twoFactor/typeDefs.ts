// Schemat GraphQL konfiguracji logowania dwuskładnikowego TOTP

export const twoFactorTypeDefs = `#graphql
  type TwoFactorSetupPayload {
    qrCodeDataUrl: String!
    backupCodes: [String!]!
  }

  type TwoFactorStatusPayload {
    enabled: Boolean!
    enabledAt: String
  }

  extend type Query {
    twoFactorStatus(userId: ID): TwoFactorStatusPayload!
  }

  extend type Mutation {
    initTwoFactor: TwoFactorSetupPayload!

    confirmTwoFactor(code: String!): TwoFactorStatusPayload!

    disableTwoFactor(userId: ID, reason: String): TwoFactorStatusPayload!
  }
`;
