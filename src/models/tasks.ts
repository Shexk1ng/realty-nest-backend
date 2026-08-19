// Schemat zadania z listą kontrolną, priorytetem i automatyczną datą zakończenia po statusie DONE

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const taskSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    title:       { type: String, required: true },
    description: { type: String, default: null },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE", "BLOCKED", "CANCELLED"],
      default: "TODO",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    dueAt:       { type: Date, default: null },
    completedAt: { type: Date, default: null },

    checklist: {
      type: [
        new Schema(
          {
            label: { type: String, required: true },
            done:  { type: Boolean, default: false },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    companyId:    { type: String, ref: "Company", required: true },
    assigneeId:   { type: String, ref: "User",    default: null },
    createdById:  { type: String, ref: "User",    default: null },

    relatedType: {
      type: String,
      enum: ["Property", "Contact", "Enquiry", "PipelineLead", "Offer", "Viewing", "Transaction", "Commission", "Document", "Campaign", "None"],
      default: "None",
    },
    relatedId: { type: String, default: null },

    propertyId: { type: String, ref: "Property",     default: null },
    contactId:  { type: String, ref: "Contact",      default: null },
    leadId:     { type: String, ref: "PipelineLead", default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

taskSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("task");

  if (this.isModified("status") && this.status === "DONE" && !this.completedAt) {
    this.completedAt = new Date();
  }
});

taskSchema.plugin(activityLogPlugin, {
  entityName: "Task",
  category: "TASK",
  prefix: "TASK",
  i18nBase: "log.task",
  labelField: "title",
  refField: "taskId",
  fieldEvents: {
    status:     { type: "TASK_STATUS_CHANGED", messageKey: "log.task.statusChanged" },
    assigneeId: { type: "TASK_ASSIGNED",       messageKey: "log.task.assigned" },
    dueAt:      { type: "TASK_DUE_CHANGED",    messageKey: "log.task.dueChanged" },
  },
});

taskSchema.index({ companyId: 1, createdAt: -1 });
taskSchema.index({ companyId: 1, assigneeId: 1 });

export const Task = model("Task", taskSchema);
