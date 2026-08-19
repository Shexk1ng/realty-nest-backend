// Wtyczka Mongoose zapisująca w dzienniku utworzenie, zmianę pól i usunięcie rekordu

import mongoose, { type Schema } from "mongoose";
import { ActivityLog } from "../logs.js";

export interface FieldEvent {
  type: string;
  messageKey: string;
}

export interface ActivityLogPluginOptions {
  entityName: string;
  category: string;
  prefix: string;
  i18nBase: string;
  labelField?: string;
  refField?: string;
  fieldEvents?: Record<string, FieldEvent>;
}

function getLabel(doc: any, labelField: string | undefined): string | null {
  if (!labelField) return null;
  return doc[labelField] ?? null;
}

function buildRefs(refField: string | undefined, doc: any): Record<string, unknown> {
  if (!refField) return {};
  const shortField = refField.replace(/Id$/, "ShortId");
  return { [refField]: doc._id, [shortField]: doc.shortId ?? null };
}

const REDACTED_SNAPSHOT_KEYS = new Set(["password", "twoFactor"]);

function redactSnapshot(snap: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(snap)) {
    out[key] = REDACTED_SNAPSHOT_KEYS.has(key) ? "[redacted]" : unwrapDecimals(value);
  }
  return out;
}

function unwrapDecimals(v: unknown): unknown {
  if (v instanceof mongoose.Types.Decimal128) return parseFloat(v.toString());
  if (Array.isArray(v)) return v.map(unwrapDecimals);
  if (v && typeof v === "object" && !(v instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = unwrapDecimals(val);
    return out;
  }
  return v;
}

/**
 * Data wpisu dziennika. Domyślnie nie podajemy jej wcale — wtedy `timestamps: true`
 * z models/logs.ts stempluje wpis chwilą zapisu i tak ma to działać w pracującej
 * aplikacji: zdarzenie i jego wpis dzieją się w tej samej sekundzie.
 *
 * Skrypty seedujące odtwarzają historię wstecz (rekordy zapisują z własnym createdAt
 * przez `save({ timestamps: false })`) i wtedy ustawiają `$locals.logAt` na datę
 * zdarzenia, którego wpis dotyczy. Bez tego cały dziennik dostawał znacznik z chwili
 * seedowania. Furtka jest świadomie WYŁĄCZNIE opt-in: żaden resolwer jej nie ustawia,
 * więc zachowanie aplikacji nie zmienia się o jotę.
 *
 * Czego ta furtka NIE obejmuje: seq, prevHash, hash i chainedAt nadaje hak pre("save")
 * w models/logs.ts w chwili zapisu i nadpisuje je bezwarunkowo. To celowe — łańcuch
 * skrótów poświadcza moment ZAPISANIA wpisu, nie datę zdarzenia, i cofanie go
 * oznaczałoby fałszowanie dowodu integralności.
 */
function znacznikCzasu(self: any): { createdAt?: Date } {
  const podany = self?.$locals?.logAt;
  return podany instanceof Date && !Number.isNaN(podany.getTime()) ? { createdAt: podany } : {};
}

export function activityLogPlugin(schema: Schema, options: ActivityLogPluginOptions) {
  const { entityName, category, prefix, i18nBase, labelField, refField, fieldEvents } = options;

  schema.pre("save", function (this: any) {
    this.$locals = this.$locals ?? {};
    this.$locals.wasNew = this.isNew;
    this.$locals.modifiedPaths = this.modifiedPaths();
  });

  schema.post("save", async function (this: any, doc: any) {
    try {
      const self: any = this;
      const wasNew: boolean = self.$locals?.wasNew ?? false;
      const modified: string[] = self.$locals?.modifiedPaths ?? [];
      const actor = self.$locals?.actor ?? null;
      const stempel = znacznikCzasu(self);
      const companyId = doc.companyId ?? null;
      const label = getLabel(doc, labelField);
      const refs = buildRefs(refField, doc);

      const baseFields = {
        actorId:      actor?._id ?? null,
        actorShortId: actor?.shortId ?? null,
        actorName:    actor?.name ?? null,
        actorRole:    actor?.role ?? null,
        targetType:   entityName,
        targetId:     doc._id,
        targetShortId: doc.shortId ?? null,
        companyId,
        ...refs,
      };

      if (wasNew) {
        await (ActivityLog as any).create({
          ...baseFields,
          ...stempel,
          type: `${prefix}_CREATED`,
          category,
          messageKey: `${i18nBase}.created`,
          messageParams: { label, shortId: doc.shortId ?? null },
          fallbackText: `${entityName} "${label ?? doc._id}" was created`,
        });
        return;
      }

      const handledFields = new Set<string>();

      if (fieldEvents) {
        for (const path of modified) {
          const ev = fieldEvents[path];
          if (!ev) continue;
          handledFields.add(path);
          const fieldValue = REDACTED_SNAPSHOT_KEYS.has(path) ? "[redacted]" : unwrapDecimals(doc[path]);
          await (ActivityLog as any).create({
            ...baseFields,
            ...stempel,
            type: ev.type,
            category,
            messageKey: ev.messageKey,
            messageParams: { label, shortId: doc.shortId ?? null, field: path, value: fieldValue },
            fallbackText: `${entityName} "${label ?? doc._id}" — ${path} changed`,
            changes: { field: path, after: fieldValue },
          });
        }
      }

      // Pola techniczne pomijamy: shortId nadaje hak modelu, a createdAt/updatedAt zmieniają
      // się przy KAŻDYM zapisie, więc bez tego filtra sama zmiana statusu produkowała drugi,
      // pusty wpis „…updated (updatedAt)”.
      const POLA_TECHNICZNE = new Set(["shortId", "createdAt", "updatedAt"]);
      const remaining = modified.filter((p) => !handledFields.has(p) && !POLA_TECHNICZNE.has(p));
      if (remaining.length === 0) return;

      await (ActivityLog as any).create({
        ...baseFields,
        ...stempel,
        type: `${prefix}_UPDATED`,
        category,
        messageKey: `${i18nBase}.updated`,
        messageParams: { label, shortId: doc.shortId ?? null, fields: remaining },
        fallbackText: `${entityName} "${label ?? doc._id}" updated (${remaining.join(", ")})`,
        changes: { fields: remaining },
      });
    } catch (err) {
      console.error(`[activityLogPlugin] post-save log failed for ${entityName}:`, err);
    }
  });

  schema.pre("deleteOne", { document: true, query: false }, function (this: any) {
    const self: any = this;
    self.$locals = self.$locals ?? {};
    self.$locals.deletedSnapshot = self.toObject();
  });

  schema.post("deleteOne", { document: true, query: false }, async function (this: any) {
    try {
      const self: any = this;
      const snap = self.$locals?.deletedSnapshot ?? self.toObject();
      const actor = self.$locals?.actor ?? null;
      const label = getLabel(snap, labelField);
      const refs = buildRefs(refField, snap);

      await (ActivityLog as any).create({
        ...znacznikCzasu(self),
        type: `${prefix}_DELETED`,
        category,
        messageKey: `${i18nBase}.deleted`,
        messageParams: { label, shortId: snap.shortId ?? null },
        fallbackText: `${entityName} "${label ?? snap._id}" was deleted`,
        actorId:      actor?._id ?? null,
        actorShortId: actor?.shortId ?? null,
        actorName:    actor?.name ?? null,
        actorRole:    actor?.role ?? null,
        targetType:   entityName,
        targetId:     snap._id,
        targetShortId: snap.shortId ?? null,
        companyId: snap.companyId ?? null,
        changes: { deleted: redactSnapshot(snap) },
        ...refs,
      });
    } catch (err) {
      console.error(`[activityLogPlugin] post-delete log failed for ${entityName}:`, err);
    }
  });
}
