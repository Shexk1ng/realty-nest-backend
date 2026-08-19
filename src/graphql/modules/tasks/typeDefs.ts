// Schemat GraphQL zadań wraz z listą kontrolną

export const taskTypeDefs = `#graphql
  type ChecklistItem {
    label: String!
    done: Boolean!
  }

  input ChecklistItemInput {
    label: String!
    done: Boolean
  }

  type Task {
    id: ID!
    shortId: Int!
    title: String!
    description: String
    status: String!
    priority: String!
    dueAt: String
    completedAt: String
    checklist: [ChecklistItem!]!
    companyId: String!
    assigneeId: String
    createdById: String
    relatedType: String!
    relatedId: String
    propertyId: String
    contactId: String
    leadId: String
    createdAt: String
    updatedAt: String
  }

  type TaskPage {
    items: [Task!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    getTasks(companyId: String, limit: Int, offset: Int): TaskPage!
  }

  extend type Mutation {
    addTask(
      title: String!
      description: String
      status: String
      priority: String
      dueAt: String
      checklist: [ChecklistItemInput!]
      assigneeId: String
      relatedType: String
      relatedId: String
      propertyId: String
      contactId: String
      leadId: String
    ): Task!

    updateTask(
      id: ID!
      title: String
      description: String
      status: String
      priority: String
      dueAt: String
      checklist: [ChecklistItemInput!]
      assigneeId: String
      relatedType: String
      relatedId: String
      propertyId: String
      contactId: String
      leadId: String
    ): Task

    deleteTask(id: ID!): Boolean
  }
`;
