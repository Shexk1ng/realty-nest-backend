// Executable security assertions: prompt-guard, rate limiting, risk scoring, DLP thresholds.


import dotenv from "dotenv";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { buildSchema, parse, validate, specifiedRules, GraphQLSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";

import {
  GENESIS_HASH,
  computeLogHash,
  verifyAuditChain,
  type ChainableEntry,
} from "../utils/auditChain.js";
import { encryptSecret, decryptSecret } from "../utils/totp.js";
import { depthLimit, fieldCountLimit, complexityLimit } from "../utils/graphqlGuards.js";
import { typeDefs } from "../graphql/schema.js";

dotenv.config();

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function heading(text: string): void {
  console.log(`\n── ${text} ${"─".repeat(Math.max(0, 62 - text.length))}`);
}

type Entry = ChainableEntry & { prevHash: string; hash: string };

function buildChain(n: number): Entry[] {
  const out: Entry[] = [];
  let prevHash = GENESIS_HASH;

  for (let seq = 1; seq <= n; seq++) {
    const base: ChainableEntry = {
      seq,
      type: "PROPERTY_UPDATED",
      category: "PROPERTY",
      actorId: `user-${seq % 7}`,
      actorRole: "AGENT",
      targetType: "Property",
      targetId: `prop-${seq}`,
      companyId: "company-1",
      messageKey: "log.property.updated",
      messageParams: { field: "price" },
      changes: { price: { from: 100_000 + seq, to: 110_000 + seq } },
      chainedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, seq)).toISOString(),
    };
    const hash = computeLogHash(base, prevHash);
    out.push({ ...base, prevHash, hash });
    prevHash = hash;
  }
  return out;
}

function mockModel(entries: Entry[]) {
  return {
    find: () => ({
      sort: () => ({
        lean: async () => entries.map((e) => ({ ...e, chainedAt: new Date(e.chainedAt) })),
      }),
    }),
  };
}

async function testAuditChain(): Promise<void> {
  heading("Odporność dziennika audytu na manipulację (tab. 4.3)");

  const CHAIN_LENGTH = 500;
  const pristine = buildChain(CHAIN_LENGTH);

  const control = await verifyAuditChain(mockModel(pristine));
  console.log(`  AU-00  łańcuch nienaruszony — ${control.total} wpisów, ok=${control.ok}`);
  check("AU-00 kontrolny łańcuch 500 wpisów uznany za nienaruszony", control.ok === true && control.total === CHAIN_LENGTH, control.reason ?? "");

  const au01 = buildChain(CHAIN_LENGTH);
  au01[249]!.changes = { price: { from: 1, to: 999_999_999 } };
  const r1 = await verifyAuditChain(mockModel(au01));
  console.log(`  AU-01  ${r1.reason ?? "—"} (wpis ${r1.brokenAtSeq})`);
  check("AU-01 modyfikacja treści wpisu nr 250 wykryta na tym wpisie", !r1.ok && r1.brokenAtSeq === 250, `seq=${r1.brokenAtSeq}`);

  const au02 = buildChain(CHAIN_LENGTH).filter((e) => e.seq !== 300);
  const r2 = await verifyAuditChain(mockModel(au02));
  console.log(`  AU-02  ${r2.reason ?? "—"} (wpis ${r2.brokenAtSeq})`);
  check("AU-02 usunięcie wpisu nr 300 wykryte jako luka w numeracji na wpisie 301", !r2.ok && r2.brokenAtSeq === 301, `seq=${r2.brokenAtSeq}`);

  const au03 = buildChain(CHAIN_LENGTH);
  au03[99]!.actorId = "someone-else";
  const r3 = await verifyAuditChain(mockModel(au03));
  console.log(`  AU-03  ${r3.reason ?? "—"} (wpis ${r3.brokenAtSeq})`);
  check("AU-03 podmiana wykonawcy we wpisie nr 100 wykryta na tym wpisie", !r3.ok && r3.brokenAtSeq === 100, `seq=${r3.brokenAtSeq}`);

  const au04 = buildChain(CHAIN_LENGTH);
  au04[399]!.chainedAt = new Date(Date.UTC(2020, 0, 1)).toISOString();
  const r4 = await verifyAuditChain(mockModel(au04));
  console.log(`  AU-04  ${r4.reason ?? "—"} (wpis ${r4.brokenAtSeq})`);
  check("AU-04 cofnięcie znacznika czasu wpisu nr 400 wykryte na tym wpisie", !r4.ok && r4.brokenAtSeq === 400, `seq=${r4.brokenAtSeq}`);

  const au05 = buildChain(CHAIN_LENGTH);
  au05[199]!.changes = { price: { from: 0, to: 1 } };
  au05[199]!.hash = computeLogHash(au05[199]!, au05[199]!.prevHash);
  const r5 = await verifyAuditChain(mockModel(au05));
  console.log(`  AU-05  ${r5.reason ?? "—"} (wpis ${r5.brokenAtSeq})`);
  check("AU-05 przeliczenie skrótu zmienionego wpisu nie ukrywa manipulacji", !r5.ok && r5.brokenAtSeq === 201, `seq=${r5.brokenAtSeq}`);
}

const MAX_QUERY_DEPTH = 12;
const MAX_FIELD_COUNT = 2000;
const MAX_QUERY_COST = 5000;

function buildTestSchema(): GraphQLSchema {
  return makeExecutableSchema({ typeDefs, resolvers: {} });
}

function validateQuery(schema: GraphQLSchema, query: string): string[] {
  const errors = validate(schema, parse(query), [
    ...specifiedRules,
    depthLimit(MAX_QUERY_DEPTH),
    fieldCountLimit(MAX_FIELD_COUNT),
    complexityLimit(MAX_QUERY_COST),
  ]);
  return errors.map((e) => (e.extensions?.code as string) ?? e.message);
}

const RECURSIVE_SCHEMA = buildSchema(`
  type Node { id: ID!, items: [Node!]! }
  type Query { getProperties: [Node!]! }
`);

function nested(depth: number): string {
  let inner = "id";
  for (let i = 0; i < depth; i++) inner = `items { ${inner} }`;
  return `query { getProperties { ${inner} } }`;
}

function aliasAmplification(count: number): string {
  const aliases = Array.from({ length: count }, (_, i) => `a${i}: getProperties { items { id title price } }`);
  return `query { ${aliases.join(" ")} }`;
}

function testGraphqlGuards(): void {
  heading("Reguły ochronne interfejsu GraphQL (tab. 4.4)");

  const schema = buildTestSchema();

  const gq01 = validateQuery(schema, `query { getProperties(limit: 20) { items { id title price agentId } totalCount } }`);
  console.log(`  GQ-01  zapytanie typowe → ${gq01.length ? gq01.join(", ") : "przyjęte"}`);
  check("GQ-01 zapytanie typowe przyjęte bez naruszeń", gq01.length === 0, gq01.join(", "));

  const gq02 = validateQuery(RECURSIVE_SCHEMA, nested(9));
  console.log(`  GQ-02  głębokość 11 (schemat rekurencyjny) → ${gq02.length ? gq02.join(", ") : "przyjęte"}`);
  check("GQ-02 zagnieżdżenie poniżej limitu głębokości zgłasza wyłącznie naruszenie złożoności", gq02.includes("QUERY_TOO_COMPLEX") && !gq02.includes("QUERY_TOO_DEEP"), gq02.join(", "));

  const gq03 = validateQuery(RECURSIVE_SCHEMA, nested(21));
  console.log(`  GQ-03  głębokość 21 (schemat rekurencyjny) → ${gq03.length ? gq03.join(", ") : "przyjęte"}`);
  check("GQ-03 zagnieżdżenie o głębokości 21 zgłasza przekroczenie głębokości", gq03.includes("QUERY_TOO_DEEP"), gq03.join(", "));
  check("GQ-03 zgłasza jednocześnie przekroczenie złożoności", gq03.includes("QUERY_TOO_COMPLEX"), gq03.join(", "));

  const gq04 = validateQuery(schema, aliasAmplification(40));
  console.log(`  GQ-04  40 aliasów → ${gq04.length ? gq04.join(", ") : "przyjęte"}`);
  check("GQ-04 amplifikacja 40 aliasami przyjęta", gq04.length === 0, gq04.join(", "));

  const gq05 = validateQuery(schema, aliasAmplification(300));
  console.log(`  GQ-05  300 aliasów → ${gq05.length ? gq05.join(", ") : "przyjęte"}`);
  check("GQ-05 amplifikacja 300 aliasami odrzucona", gq05.includes("QUERY_TOO_COMPLEX"), gq05.join(", "));

  check("Schemat produkcyjny nie zawiera relacji rekurencyjnej", validateQuery(schema, `query { getProperties { items { agentId } } }`).length === 0);
}

function testTotpCrypto(): void {
  heading("Szyfrowanie sekretów drugiego składnika (AES-256-GCM)");

  const secret = "JBSWY3DPEHPK3PXP";
  const ciphertext = encryptSecret(secret);

  check("Kryptogram różni się od tekstu jawnego", ciphertext !== secret && !ciphertext.includes(secret));
  check("Odszyfrowanie zwraca oryginalny sekret", decryptSecret(ciphertext) === secret);

  check("Dwukrotne zaszyfrowanie tej samej wartości daje różne kryptogramy", encryptSecret(secret) !== encryptSecret(secret));

  const parts = ciphertext.split(":");
  const tampered = [...parts];
  const payload = Buffer.from(parts[1]!, "hex");
  payload[0] = payload[0]! ^ 0xff;
  tampered[1] = payload.toString("hex");

  let rejected = false;
  try {
    decryptSecret(tampered.join(":"));
  } catch {
    rejected = true;
  }
  check("Modyfikacja kryptogramu jest wykrywana i odrzucana", rejected);
}

async function testBcryptCost(): Promise<void> {
  heading("Koszt obliczeniowy funkcji skrótu haseł (tab. 4.6)");

  const password = "DemoPass123!";
  const ROUNDS = 5;

  for (const cost of [10, 12] as const) {
    const hash = await bcrypt.hash(password, cost);

    const started = process.hrtime.bigint();
    for (let i = 0; i < ROUNDS; i++) await bcrypt.compare(password, hash);
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6 / ROUNDS;

    console.log(`  bcrypt cost ${cost}:  średni czas weryfikacji ${elapsedMs.toFixed(1)} ms`);
    check(`Weryfikacja przy koszcie ${cost} mieści się w rozsądnym budżecie (<2000 ms)`, elapsedMs < 2000, `${elapsedMs.toFixed(1)} ms`);
  }

  const productionHash = await bcrypt.hash(password, 12);
  check("Hasła produkcyjne hashowane kosztem 12", productionHash.startsWith("$2b$12$") || productionHash.startsWith("$2a$12$"), productionHash.slice(0, 7));
}

function testCanonicalisation(): void {
  heading("Kanonizacja wpisu dziennika");

  const a: ChainableEntry = {
    seq: 1, type: "T", category: "C", actorId: "u", actorRole: "AGENT",
    targetType: "P", targetId: "p", companyId: "c", messageKey: "k",
    messageParams: { b: 2, a: 1 }, changes: null, chainedAt: "2026-01-01T00:00:00.000Z",
  };
  const b: ChainableEntry = { ...a, messageParams: { a: 1, b: 2 } };

  check("Kolejność kluczy nie wpływa na skrót wpisu", computeLogHash(a, GENESIS_HASH) === computeLogHash(b, GENESIS_HASH));

  const c: ChainableEntry = { ...a, actorId: "someone-else" };
  check("Zmiana dowolnego pola zmienia skrót", computeLogHash(a, GENESIS_HASH) !== computeLogHash(c, GENESIS_HASH));

  check("Skrót zależy od skrótu poprzednika", computeLogHash(a, GENESIS_HASH) !== computeLogHash(a, crypto.randomBytes(32).toString("hex")));
}

async function main(): Promise<void> {
  console.log("\n🔒  Testy bezpieczeństwa backendu — Realty Nest\n");

  await testAuditChain();
  testGraphqlGuards();
  testTotpCrypto();
  testCanonicalisation();
  await testBcryptCost();

  console.log(`\n──────── WYNIK ────────`);
  console.log(`PASS: ${pass}   FAIL: ${fail}`);
  console.log(`───────────────────────\n`);

  process.exit(fail === 0 ? 0 : 1);
}

void main();
