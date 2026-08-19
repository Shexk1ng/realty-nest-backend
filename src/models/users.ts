// Schemat konta użytkownika z rolą, logowaniem dwuskładnikowym i przypisaniem asystenta do agenta

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type UserRole =
  | "SYSTEM_ADMIN"
  | "COMPANY_ADMIN"
  | "MANAGER"
  | "AGENT"
  | "AGENT_ASSISTANT";

const profileSchema = new Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: null },
    phoneMobile: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    profilePictureUrl: { type: String, default: null },
    bio: { type: String, default: null },
    jobTitle: { type: String, default: null },
    licenseNumber: { type: String, default: null },
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    name: { type: String, required: true },

    profile: { type: profileSchema, default: () => ({}) },

    twoFactor: {
      type: new Schema(
        {
          enabled: { type: Boolean, default: false },
          secret: { type: String, default: null },
          backupCodes: { type: [String], default: [] },
          enabledAt: { type: Date, default: null },
        },
        { _id: false },
      ),
      default: () => ({ enabled: false, secret: null, backupCodes: [], enabledAt: null }),
    },

    sessionInvalidatedAt: { type: Date, default: null },

    role: {
      type: String,
      enum: ["SYSTEM_ADMIN", "COMPANY_ADMIN", "MANAGER", "AGENT", "AGENT_ASSISTANT"],
      default: "AGENT",
    },
    companyId: { type: String, ref: "Company", default: null },

    assignedAgentId: { type: String, ref: "User", default: null },

    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },

    allocationEnabled:    { type: Boolean, default: true },
    allocationQueueOrder: { type: Number, default: null },
  },
  { timestamps: true, _id: false },
);

userSchema.virtual("fullName").get(function () {
  const { firstName, lastName } = this.profile ?? {};
  const full = [firstName, lastName].filter(Boolean).join(" ");
  return full || this.name;
});

userSchema.pre("save", async function () {
  if (this.isNew) {
    this.shortId = await nextSeq("user");
  }
  if (this.isNew && this.profile?.firstName) {
    const full = [this.profile.firstName, this.profile.lastName].filter(Boolean).join(" ");
    if (!this.name) this.name = full;
  }
});

userSchema.plugin(activityLogPlugin, {
  entityName: "User",
  category: "USER",
  prefix: "USER",
  i18nBase: "log.user",
  labelField: "name",
  refField: "userId",
  fieldEvents: {
    role:     { type: "USER_ROLE_CHANGED",      messageKey: "log.user.roleChanged" },
    isActive: { type: "USER_UPDATED",            messageKey: "log.user.activeChanged" },
    password: { type: "AUTH_PASSWORD_CHANGED",   messageKey: "log.auth.passwordChanged" },
  },
});

userSchema.index({ companyId: 1, isActive: 1 });

export const User = model("User", userSchema);
