// Wystawia i weryfikuje tokeny JWT, odrzucając token przejściowy 2FA jako klucz dostępu do API

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface TokenPayload extends Omit<JWTPayload, "sub"> {
  sub: string;
  role: string;
  companyId: string | null;
  shortId: number;
  twoFactorEnabled?: boolean;
  assignedAgentId?: string | null;
}

export type SignTokenInput = {
  sub: string;
  role: string;
  companyId: string | null;
  shortId: number;
  twoFactorEnabled?: boolean;
  assignedAgentId?: string | null;
};

export interface PendingTwoFactorPayload extends JWTPayload {
  pending2fa: true;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: SignTokenInput): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if ((payload as any).pending2fa) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function signPendingToken(sub: string): Promise<string> {
  return new SignJWT({ sub, pending2fa: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getSecret());
}

export async function verifyPendingToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.pending2fa || !payload.sub) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
