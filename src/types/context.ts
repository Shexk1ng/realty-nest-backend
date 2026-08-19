// Typ kontekstu przekazywanego do każdego resolvera GraphQL

import type { TokenPayload } from "../utils/jwt.js";

export interface GqlContext {
  user: TokenPayload | null;
  ip: string | unknown;
  userAgent?: string | null;
}
