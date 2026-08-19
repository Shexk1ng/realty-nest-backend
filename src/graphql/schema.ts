// Scala definicje typów i resolwery obszarów domenowych w jeden serwowany schemat GraphQL

import { authResolvers } from "./modules/auth/resolvers.js";
import { authTypeDefs } from "./modules/auth/typeDefs.js";
import { backupResolvers } from "./modules/backup/resolvers.js";
import { backupTypeDefs } from "./modules/backup/typeDefs.js";
import { calendarResolvers } from "./modules/calendar/resolvers.js";
import { calendarTypeDefs } from "./modules/calendar/typeDefs.js";
import { commissionResolvers } from "./modules/commissions/resolvers.js";
import { commissionTypeDefs } from "./modules/commissions/typeDefs.js";
import { companyResolvers } from "./modules/companies/resolvers.js";
import { companyTypeDefs } from "./modules/companies/typeDefs.js";
import { contactResolvers } from "./modules/contacts/resolvers.js";
import { contactTypeDefs } from "./modules/contacts/typeDefs.js";
import { documentResolvers } from "./modules/documents/resolvers.js";
import { documentTypeDefs } from "./modules/documents/typeDefs.js";
import { enquiryResolvers } from "./modules/enquiries/resolvers.js";
import { enquiryTypeDefs } from "./modules/enquiries/typeDefs.js";
import { logResolvers } from "./modules/logs/resolvers.js";
import { logTypeDefs } from "./modules/logs/typeDefs.js";
import { marketingResolvers } from "./modules/marketing/resolvers.js";
import { marketingTypeDefs } from "./modules/marketing/typeDefs.js";
import { pipelineResolvers } from "./modules/pipeline/resolvers.js";
import { pipelineTypeDefs } from "./modules/pipeline/typeDefs.js";
import { propertyResolvers } from "./modules/properties/resolvers.js";
import { propertyTypeDefs } from "./modules/properties/typeDefs.js";
import { propshareResolvers } from "./modules/propshare/resolvers.js";
import { propshareTypeDefs } from "./modules/propshare/typeDefs.js";
import { taskResolvers } from "./modules/tasks/resolvers.js";
import { taskTypeDefs } from "./modules/tasks/typeDefs.js";
import { transactionResolvers } from "./modules/transactions/resolvers.js";
import { transactionTypeDefs } from "./modules/transactions/typeDefs.js";
import { twoFactorResolvers } from "./modules/twoFactor/resolvers.js";
import { twoFactorTypeDefs } from "./modules/twoFactor/typeDefs.js";
import { userResolvers } from "./modules/users/resolvers.js";
import { userTypeDefs } from "./modules/users/typeDefs.js";
import { viewingResolvers } from "./modules/viewings/resolvers.js";
import { viewingTypeDefs } from "./modules/viewings/typeDefs.js";

const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  companyTypeDefs,
  userTypeDefs,
  propertyTypeDefs,
  twoFactorTypeDefs,
  contactTypeDefs,
  enquiryTypeDefs,
  commissionTypeDefs,
  documentTypeDefs,
  calendarTypeDefs,
  pipelineTypeDefs,
  marketingTypeDefs,
  logTypeDefs,
  propshareTypeDefs,
  transactionTypeDefs,
  taskTypeDefs,
  viewingTypeDefs,
  backupTypeDefs,
];

export const resolvers = [
  authResolvers,
  companyResolvers,
  userResolvers,
  propertyResolvers,
  twoFactorResolvers,
  contactResolvers,
  enquiryResolvers,
  commissionResolvers,
  documentResolvers,
  calendarResolvers,
  pipelineResolvers,
  marketingResolvers,
  logResolvers,
  propshareResolvers,
  transactionResolvers,
  taskResolvers,
  viewingResolvers,
  backupResolvers,
];
