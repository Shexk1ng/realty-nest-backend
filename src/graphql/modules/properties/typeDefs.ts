// Schemat GraphQL ofert nieruchomości wraz z okrojonym typem publicznym

export const propertyTypeDefs = `#graphql
  type PropertyAddress {
    street: String
    district: String
    city: String
    postalCode: String
    country: String
    lat: Float
    lng: Float
  }

  type PropertyDescriptionSections {
    intro: String
    layout: String
    location: String
    additional: String
  }

  type Property {
    id: ID!
    shortId: Int!
    title: String!
    price: Float!
    location: String!
    description: String
    descriptionSections: PropertyDescriptionSections

    transactionType: String
    propertyType: String
    market: String
    status: String!

    area: Float
    plotArea: Float
    rooms: Int
    bedrooms: Int
    bathrooms: Int
    floor: Int
    totalFloors: Int
    yearBuilt: Int
    pricePerM2: Float

    monthlyRent: Float
    deposit: Float

    ownership: String
    condition: String
    heating: String
    energyClass: String
    availableFrom: String

    features: [String!]
    address: PropertyAddress

    imageUrl: String
    images: [String!]
    virtualTourUrl: String
    floorPlanUrl: String
    energyCertificateUrl: String

    companyId: String!
    agentId: String

    propShareListed: Boolean
    propShareListedAt: String
    propShareNotes: String
    contentApprovedAt: String

    createdAt: String
    updatedAt: String
  }

  """
  Address as served to an anonymous visitor. Exact coordinates identify the
  individual flat, so they are replaced by a pair rounded to two decimals
  (~1 km), enough to centre a map on the neighbourhood and nothing more.
  """
  type PublicPropertyAddress {
    street: String
    district: String
    city: String
    postalCode: String
    country: String
    approxLat: Float
    approxLng: Float
  }

  """
  Allow-list projection of Property for anonymous callers. Internal data
  (companyId, agentId, status, deposit, monthlyRent, propShareNotes,
  contentApprovedAt, energyCertificateUrl, exact coordinates) has no field on
  this type, so no field selection can reach it. Field resolvers registered on
  Property — including the PropShare owner-identity ones — do not apply here.
  """
  type PublicProperty {
    id: ID!
    shortId: Int!
    title: String!
    description: String
    price: Float!
    location: String!

    transactionType: String
    propertyType: String
    market: String

    area: Float
    plotArea: Float
    rooms: Int
    bedrooms: Int
    bathrooms: Int
    floor: Int
    totalFloors: Int
    yearBuilt: Int
    pricePerM2: Float

    energyClass: String
    availableFrom: String

    features: [String!]
    address: PublicPropertyAddress

    imageUrl: String
    images: [String!]
    virtualTourUrl: String
    floorPlanUrl: String
  }

  input PropertyAddressInput {
    street: String
    district: String
    city: String
    postalCode: String
    country: String
    lat: Float
    lng: Float
  }

  input PropertyDescriptionSectionsInput {
    intro: String
    layout: String
    location: String
    additional: String
  }

  type PropertyPage {
    items: [Property!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getProperties(companyId: String, agentId: String, status: String, search: String, limit: Int, offset: Int): PropertyPage!
    getPropertyById(id: ID!): Property
    """
    Unauthenticated read for the public listing page. Serves only offers that
    are active, non-deleted and content-approved, and returns them through the
    PublicProperty allow-list, never the internal Property type.
    """
    getPublicProperty(id: ID!): PublicProperty
  }

  extend type Mutation {
    addProperty(
      title: String!
      price: Float!
      location: String!
      description: String
      descriptionSections: PropertyDescriptionSectionsInput
      transactionType: String
      propertyType: String
      market: String
      status: String
      area: Float
      plotArea: Float
      rooms: Int
      bedrooms: Int
      bathrooms: Int
      floor: Int
      totalFloors: Int
      yearBuilt: Int
      monthlyRent: Float
      deposit: Float
      ownership: String
      condition: String
      heating: String
      energyClass: String
      availableFrom: String
      features: [String!]
      address: PropertyAddressInput
      imageUrl: String
      images: [String!]
      virtualTourUrl: String
      floorPlanUrl: String
      energyCertificateUrl: String
      agentId: String
    ): Property!

    updateProperty(
      id: ID!
      title: String
      price: Float
      location: String
      description: String
      descriptionSections: PropertyDescriptionSectionsInput
      transactionType: String
      propertyType: String
      market: String
      status: String
      area: Float
      plotArea: Float
      rooms: Int
      bedrooms: Int
      bathrooms: Int
      floor: Int
      totalFloors: Int
      yearBuilt: Int
      monthlyRent: Float
      deposit: Float
      ownership: String
      condition: String
      heating: String
      energyClass: String
      availableFrom: String
      features: [String!]
      address: PropertyAddressInput
      imageUrl: String
      images: [String!]
      virtualTourUrl: String
      floorPlanUrl: String
      energyCertificateUrl: String
      agentId: String
    ): Property

    deleteProperty(id: ID!): Boolean

    "Approves the offer's content for the public listing page."
    publishPropertyContent(id: ID!): Property
    "Withdraws the offer from the public listing page."
    unpublishPropertyContent(id: ID!): Property
  }
`;
