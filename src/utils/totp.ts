// Obsługa drugiego składnika logowania: sekret TOTP, kod QR, szyfrowanie i kody zapasowe

import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const APP_NAME = "Realty Nest";

function getEncryptKey(): Buffer {
  const key = process.env.TOTP_ENCRYPT_KEY;
  if (!key) throw new Error("TOTP_ENCRYPT_KEY env var is not set");
  return Buffer.from(key, "hex");
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), encrypted.toString("hex"), tag.toString("hex")].join(":");
}

export function decryptSecret(ciphertext: string): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted secret format");
  const ivHex = parts[0]!;
  const encHex = parts[1]!;
  const tagHex = parts[2]!;
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function generateTotpSecret(): string {
  return generateSecret({ length: 20 });
}

export async function generateQrCodeDataUrl(email: string, secret: string): Promise<string> {
  const otpauth = generateURI({ issuer: APP_NAME, label: email, secret });
  return QRCode.toDataURL(otpauth);
}

export async function verifyTotpCode(secret: string, token: string): Promise<boolean> {
  try {
    const result = await verify({ secret, token, epochTolerance: 30 });
    return result.valid;
  } catch {
    return false;
  }
}

export async function generateBackupCodes(): Promise<{ plain: string[]; hashed: string[] }> {
  const plain = Array.from({ length: 8 }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase().replace(/(.{4})/g, "$1-").slice(0, 9),
  );
  const hashed = await Promise.all(plain.map((c) => bcrypt.hash(c, 10)));
  return { plain, hashed };
}

export async function verifyAndConsumeBackupCode(
  inputCode: string,
  hashedCodes: string[],
): Promise<{ valid: boolean; remaining: string[] }> {
  const normalized = inputCode.replace(/-/g, "").toUpperCase();
  for (let i = 0; i < hashedCodes.length; i++) {
    const hash = hashedCodes[i];
    if (!hash) continue;
    const match = await bcrypt.compare(normalized, hash);
    if (match) {
      const remaining = [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
      return { valid: true, remaining };
    }
  }
  return { valid: false, remaining: hashedCodes };
}
