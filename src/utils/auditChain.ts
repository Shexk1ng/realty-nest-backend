// Łańcuch skrótów dziennika zdarzeń: liczy hasz wpisu z haszem poprzednika i wykrywa naruszenia

import crypto from "node:crypto";

export const GENESIS_HASH = "0".repeat(64);

export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export interface ChainableEntry {
  seq: number;
  type: string;
  category: string;
  actorId: string | null;
  actorRole: string | null;
  targetType: string | null;
  targetId: string | null;
  companyId: string | null;
  messageKey: string;
  messageParams: unknown;
  changes: unknown;
  chainedAt: string;
}

export function canonicalizeLog(e: ChainableEntry): string {
  return stableStringify({
    seq: e.seq,
    type: e.type,
    category: e.category,
    actorId: e.actorId ?? null,
    actorRole: e.actorRole ?? null,
    targetType: e.targetType ?? null,
    targetId: e.targetId ?? null,
    companyId: e.companyId ?? null,
    messageKey: e.messageKey,
    messageParams: e.messageParams ?? null,
    changes: e.changes ?? null,
    chainedAt: e.chainedAt,
  });
}

export function computeLogHash(entry: ChainableEntry, prevHash: string): string {
  return crypto.createHash("sha256").update(`${prevHash}|${canonicalizeLog(entry)}`).digest("hex");
}

export interface ChainVerifyResult {
  ok: boolean;
  total: number;
  brokenAtSeq: number | null;
  reason: string | null;
  checkedAt: string;
}

interface RawLog extends Omit<ChainableEntry, "chainedAt"> {
  hash: string;
  prevHash: string;
  chainedAt: unknown;
}

export async function verifyAuditChain(Model: {
  find: (q: unknown) => { sort: (s: unknown) => { lean: () => Promise<unknown[]> } };
}): Promise<ChainVerifyResult> {
  const docs = (await Model.find({ seq: { $ne: null } }).sort({ seq: 1 }).lean()) as RawLog[];
  let prevHash = GENESIS_HASH;
  let expectedSeq = docs.length > 0 ? docs[0]!.seq : 1;

  for (const d of docs) {
    const chainedAtIso = d.chainedAt instanceof Date ? d.chainedAt.toISOString() : String(d.chainedAt ?? "");
    if (d.seq !== expectedSeq) {
      return fail(docs.length, d.seq, `Sequence gap: expected ${expectedSeq}, found ${d.seq}`);
    }
    if (d.prevHash !== prevHash) {
      return fail(docs.length, d.seq, "Broken link: prevHash does not match previous entry");
    }
    const recomputed = computeLogHash({ ...d, chainedAt: chainedAtIso }, prevHash);
    if (recomputed !== d.hash) {
      return fail(docs.length, d.seq, "Hash mismatch: entry content was modified");
    }
    prevHash = d.hash;
    expectedSeq++;
  }

  return { ok: true, total: docs.length, brokenAtSeq: null, reason: null, checkedAt: new Date().toISOString() };
}

function fail(total: number, seq: number, reason: string): ChainVerifyResult {
  return { ok: false, total, brokenAtSeq: seq, reason, checkedAt: new Date().toISOString() };
}
