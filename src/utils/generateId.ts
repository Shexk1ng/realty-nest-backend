// Losuje szesnastkowy identyfikator używany jako klucz główny rekordów dziedzinowych

import crypto from "node:crypto";

export function generateId(): string {
  return crypto.randomBytes(8).toString("hex");
}
