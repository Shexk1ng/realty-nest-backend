// Walidacja danych wejściowych, czyszczenie zapytań Mongo i sprawdzanie zmiennych środowiskowych

import { GraphQLError } from "graphql";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) {
    throw new GraphQLError("Invalid email address.", { extensions: { code: "BAD_USER_INPUT" } });
  }
  return normalized;
}

export function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new GraphQLError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}

const PHONE_RE = /^\+?[\d\s\-().]{7,30}$/;

export function validatePhone(value: unknown, field = "Phone"): string {
  if (value === null || value === undefined || value === "") {
    throw new GraphQLError(`${field} is required.`, { extensions: { code: "BAD_USER_INPUT" } });
  }
  if (typeof value !== "string") {
    throw new GraphQLError(`${field} must be a string.`, { extensions: { code: "BAD_USER_INPUT" } });
  }
  const trimmed = value.trim();
  if (!PHONE_RE.test(trimmed)) {
    throw new GraphQLError(`${field} is not a valid phone number.`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return trimmed;
}

export function validateString(
  value: unknown,
  field: string,
  { min = 0, max = 5000, required = false }: { min?: number; max?: number; required?: boolean } = {},
): string | null {
  if (value === null || value === undefined || value === "") {
    if (required) throw badInput(`${field} is required.`);
    return null;
  }
  if (typeof value !== "string") {
    throw badInput(`${field} must be a string.`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) throw badInput(`${field} must be at least ${min} characters.`);
  if (trimmed.length > max) throw badInput(`${field} must be at most ${max} characters.`);
  return trimmed;
}

export function validateEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  { required = false }: { required?: boolean } = {},
): T | null {
  if (value === null || value === undefined || value === "") {
    if (required) throw badInput(`${field} is required.`);
    return null;
  }
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw badInput(`${field} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T;
}

export function sanitizeMongo<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((v) => sanitizeMongo(v)) as unknown as T;
  }
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      out[key] = sanitizeMongo(val);
    }
    return out as T;
  }
  return input;
}

export function sanitizeScalar(value: unknown, field: string): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") {
    throw badInput(`${field} must be a single value.`);
  }
  return value as string | number | boolean;
}

function badInput(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

export function validateEnv(): void {
  const required = ["JWT_SECRET", "TOTP_ENCRYPT_KEY", "MONGO_URI"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Set them in realty-nest-db/.env before starting the server.`,
    );
  }
  const totpKey = process.env.TOTP_ENCRYPT_KEY ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(totpKey)) {
    throw new Error("TOTP_ENCRYPT_KEY must be 64 hex characters (32 bytes) for AES-256-GCM.");
  }
}
