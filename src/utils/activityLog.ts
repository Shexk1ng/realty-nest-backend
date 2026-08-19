// Zapisuje wpis do dziennika zdarzeń, uzupełniając dane sprawcy, celu i odwołań do rekordów

import { ActivityLog, type LogCategory, type LogType, type LogTargetType } from "../models/logs.js";

export interface ActorInput {
  _id?: string;
  shortId?: number;
  name?: string;
  role?: string;
}

export interface TargetInput {
  type: LogTargetType;
  id?: string | null;
  shortId?: number | null;
}

export interface CrossRefs {
  propertyId?: string | null;       propertyShortId?: number | null;
  contactId?: string | null;        contactShortId?: number | null;
  enquiryId?: string | null;        enquiryShortId?: number | null;
  leadId?: string | null;           leadShortId?: number | null;
  commissionId?: string | null;     commissionShortId?: number | null;
  documentId?: string | null;       documentShortId?: number | null;
  campaignId?: string | null;       campaignShortId?: number | null;
  eventId?: string | null;          eventShortId?: number | null;
  userId?: string | null;           userShortId?: number | null;
}

export interface LogActivityInput {
  type: LogType;
  category: LogCategory;
  messageKey: string;
  messageParams?: Record<string, unknown>;
  fallbackText?: string;

  actor?: ActorInput | null;
  target?: TargetInput;
  refs?: CrossRefs;

  changes?: { before?: unknown; after?: unknown } | null;

  companyId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await ActivityLog.create({
      type: input.type,
      category: input.category,
      messageKey: input.messageKey,
      messageParams: input.messageParams ?? {},
      fallbackText: input.fallbackText ?? null,

      actorId:      input.actor?._id ?? null,
      actorShortId: input.actor?.shortId ?? null,
      actorName:    input.actor?.name ?? null,
      actorRole:    input.actor?.role ?? null,

      targetType:    input.target?.type ?? "None",
      targetId:      input.target?.id ?? null,
      targetShortId: input.target?.shortId ?? null,

      ...(input.refs ?? {}),

      changes:   input.changes ?? null,
      companyId: input.companyId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
  } catch (err) {
    console.error("[activityLog] failed to write entry:", err);
  }
}
