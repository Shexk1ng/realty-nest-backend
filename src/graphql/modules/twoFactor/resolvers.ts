// Włączanie, potwierdzanie i wyłączanie logowania dwuskładnikowego TOTP wraz z kodami zapasowymi

import { GraphQLError } from "graphql";
import { User } from "../../../models/users.js";
import type { GqlContext } from "../../../types/context.js";
import {
  generateTotpSecret,
  generateQrCodeDataUrl,
  generateBackupCodes,
  verifyTotpCode,
  encryptSecret,
  decryptSecret,
} from "../../../utils/totp.js";
import { attachActor, saveValidated } from "../_shared/crud.js";

function requireAuth(user: GqlContext["user"]): NonNullable<GqlContext["user"]> {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return user;
}

function assertCanManageUser(
  caller: NonNullable<GqlContext["user"]>,
  targetId: string,
  target: { companyId?: string | null },
): void {
  if (caller.sub === targetId) return;
  if (caller.role === "SYSTEM_ADMIN") return;
  if (caller.role === "COMPANY_ADMIN" && caller.companyId === target.companyId) return;
  throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
}

export const twoFactorResolvers = {
  Query: {
    twoFactorStatus: async (
      _: unknown,
      { userId }: { userId?: string },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const targetId = userId ?? caller.sub;
      const doc = await User.findById(targetId).select("twoFactor companyId").lean();
      if (!doc) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
      assertCanManageUser(caller, targetId, doc as { companyId?: string | null });
      const tf = (doc as any).twoFactor ?? {};
      return {
        enabled: tf.enabled ?? false,
        enabledAt: tf.enabledAt?.toISOString() ?? null,
      };
    },
  },

  Mutation: {
    initTwoFactor: async (_: unknown, __: unknown, { user }: GqlContext) => {
      const caller = requireAuth(user);
      const doc = await User.findById(caller.sub);
      if (!doc) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });

      const secret = generateTotpSecret();
      const qrCodeDataUrl = await generateQrCodeDataUrl(doc.email, secret);
      const { plain, hashed } = await generateBackupCodes();

      doc.set("twoFactor", {
        enabled: false,
        secret: encryptSecret(secret),
        backupCodes: hashed,
        enabledAt: null,
      });
      attachActor(doc, caller);
      await saveValidated(doc);

      return { qrCodeDataUrl, backupCodes: plain };
    },

    confirmTwoFactor: async (_: unknown, { code }: { code: string }, { user }: GqlContext) => {
      const caller = requireAuth(user);
      const doc = await User.findById(caller.sub);
      if (!doc) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });

      const tf = (doc as any).twoFactor;
      if (!tf?.secret) {
        throw new GraphQLError("No pending 2FA setup. Call initTwoFactor first.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (tf.enabled) {
        throw new GraphQLError("2FA is already enabled.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const secret = decryptSecret(tf.secret);
      if (!(await verifyTotpCode(secret, code.replace(/\s/g, "")))) {
        throw new GraphQLError("Invalid or expired code.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const enabledAt = new Date();
      doc.set("twoFactor.enabled", true);
      doc.set("twoFactor.enabledAt", enabledAt);
      attachActor(doc, caller);
      await saveValidated(doc);

      return { enabled: true, enabledAt: enabledAt.toISOString() };
    },

    disableTwoFactor: async (
      _: unknown,
      { userId }: { userId?: string; reason?: string },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const targetId = userId ?? caller.sub;

      const doc = await User.findById(targetId);
      if (!doc) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
      assertCanManageUser(caller, targetId, doc);

      doc.set("twoFactor", { enabled: false, secret: null, backupCodes: [], enabledAt: null });
      doc.set("sessionInvalidatedAt", new Date());
      attachActor(doc, caller);
      await saveValidated(doc);

      return { enabled: false, enabledAt: null };
    },
  },
};
