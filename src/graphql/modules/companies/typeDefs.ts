// Schemat GraphQL firm i ich ustawień

export const companyTypeDefs = `#graphql
  enum CompanyType {
    PLATFORM
    REAL_ESTATE_COMPANY
  }

  type CompanyAddress {
    street: String
    city: String
    postalCode: String
    country: String
  }

  type FormDisclaimerLocale {
    text: String
    linkLabel: String
    linkUrl: String
  }

  type FormDisclaimer {
    pl: FormDisclaimerLocale
    en: FormDisclaimerLocale
  }

  type CompanySettings {
    nip: String
    website: String
    phone: String
    email: String
    address: CompanyAddress
    licenseNumber: String
    timezone: String
    language: String
    formDisclaimer: FormDisclaimer
    dataRetentionDays: Int
  }

  type Company {
    id: ID!
    shortId: Int!
    name: String!
    domain: String
    logoUrl: String
    coverImageUrl: String
    isActive: Boolean!
    type: CompanyType!
    settings: CompanySettings!
    userCount: Int!
    createdAt: String
  }

  input CompanyAddressInput {
    street: String
    city: String
    postalCode: String
    country: String
  }

  input FormDisclaimerLocaleInput {
    text: String
    linkLabel: String
    linkUrl: String
  }

  input FormDisclaimerInput {
    pl: FormDisclaimerLocaleInput
    en: FormDisclaimerLocaleInput
  }

  input CompanySettingsInput {
    nip: String
    website: String
    phone: String
    email: String
    address: CompanyAddressInput
    licenseNumber: String
    timezone: String
    language: String
    formDisclaimer: FormDisclaimerInput
    dataRetentionDays: Int
  }

  type CompanyPage {
    items: [Company!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getCompanies(limit: Int, offset: Int): CompanyPage!
    getCompanyById(id: ID!): Company
  }

  extend type Mutation {
    createCompany(
      name: String!
      domain: String
      type: CompanyType
      settings: CompanySettingsInput
      adminEmail: String!
      adminName: String!
      adminPassword: String!
    ): Company!

    updateCompany(
      id: ID!
      name: String
      domain: String
      logoUrl: String
      coverImageUrl: String
      isActive: Boolean
      settings: CompanySettingsInput
    ): Company

    deactivateCompany(id: ID!): Company
  }
`;
