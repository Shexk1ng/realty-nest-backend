// Pamięciowy licznik żądań na klucz, blokujący nadmiarowe wywołania w oknie czasowym

import { GraphQLError } from "graphql";

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>();

const SWEEP_INTERVAL_MS = 10 * 60_000;
const sweepTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, SWEEP_INTERVAL_MS);
sweepTimer.unref();

export function checkRateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    throw new GraphQLError(`Too many attempts. Try again in ${retryAfter}s.`, {
      extensions: { code: "TOO_MANY_REQUESTS", retryAfter },
    });
  }
  entry.count++;
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}
