// Logowanie hasłem i weryfikacja drugiego składnika wraz z limitem prób i wpisami do dziennika

import bcrypt from "bcryptjs";
import { User } from "../../../models/users.js";
import { signToken, signPendingToken, verifyPendingToken } from "../../../utils/jwt.js";
import { verifyTotpCode, verifyAndConsumeBackupCode, decryptSecret } from "../../../utils/totp.js";
import { GraphQLError } from "graphql";
import type { GqlContext } from "../../../types/context.js";
import { checkRateLimit, resetRateLimit } from "../../../utils/rateLimiter.js";
import { validateEmail } from "../../../utils/validate.js";
import { logActivity } from "../../../utils/activityLog.js";

function clientIp(ip: GqlContext["ip"]): string {
  if (Array.isArray(ip)) return String(ip[0] ?? "unknown");
  return String(ip ?? "unknown");
}

function authActor(user: InstanceType<typeof User>) {
  return {
    _id: user._id as string,
    shortId: user.shortId ?? 0,
    name: user.name,
    role: user.role,
  };
}

function userTarget(user: InstanceType<typeof User>) {
  return { type: "User" as const, id: user._id as string, shortId: user.shortId ?? null };
}

function mapAuthUser(user: InstanceType<typeof User>) {
  return {
    id: user._id,
    shortId: user.shortId,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    twoFactorEnabled: (user as any).twoFactor?.enabled ?? false,
  };
}

export const authResolvers = {
  Query: {
    checkEmail: async (_: unknown, { email }: { email: string }, { ip }: GqlContext) => {
      checkRateLimit(`checkEmail:${String(ip)}`, 20, 15 * 60 * 1000);
      const user = await User.exists({ email: email.toLowerCase().trim(), isActive: true });
      return !!user;
    },
  },

  Mutation: {
    login: async (_: unknown, { email, password }: { email: string; password: string }, { ip, userAgent }: GqlContext) => {
      const normalizedEmail = validateEmail(email);
      const ipAddress = clientIp(ip);
      const ua = userAgent ?? null;

      const ipKey = `login:ip:${String(ip)}`;
      const accountKey = `login:acct:${normalizedEmail}`;
      checkRateLimit(ipKey, 10, 15 * 60 * 1000);
      checkRateLimit(accountKey, 10, 15 * 60 * 1000);

      const user = await User.findOne({ email: normalizedEmail, isActive: true });
      if (!user) {
        await logActivity({
          type: "AUTH_LOGIN_FAILED", category: "AUTH", messageKey: "auth.loginFailed",
          messageParams: { email: normalizedEmail, reason: "unknown_account" },
          fallbackText: `Failed login for ${normalizedEmail} (unknown account)`,
          target: { type: "None" }, ipAddress, userAgent: ua,
        });
        throw new GraphQLError("Invalid credentials", { extensions: { code: "UNAUTHENTICATED" } });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        await logActivity({
          type: "AUTH_LOGIN_FAILED", category: "AUTH", messageKey: "auth.loginFailed",
          messageParams: { email: normalizedEmail, reason: "bad_password" },
          fallbackText: `Failed login for ${normalizedEmail} (incorrect password)`,
          actor: authActor(user), target: userTarget(user),
          companyId: user.companyId ?? null, ipAddress, userAgent: ua,
        });
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED", userId: user._id as string },
        });
      }

      resetRateLimit(ipKey);
      resetRateLimit(accountKey);

      const twoFactorEnabled = (user as any).twoFactor?.enabled ?? false;

      if (!twoFactorEnabled) {
        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
        await logActivity({
          type: "AUTH_LOGIN", category: "AUTH", messageKey: "auth.login",
          messageParams: { email: normalizedEmail, method: "password" },
          fallbackText: `${user.name} signed in`,
          actor: authActor(user), target: userTarget(user),
          companyId: user.companyId ?? null, ipAddress, userAgent: ua,
        });
      }

      if (twoFactorEnabled) {
        const pendingToken = await signPendingToken(user._id as string);
        return {
          accessToken: null,
          twoFactorRequired: true,
          pendingToken,
          user: mapAuthUser(user),
        };
      }

      const accessToken = await signToken({
        sub: user._id as string,
        role: user.role,
        companyId: user.companyId ?? null,
        shortId: user.shortId ?? 0,
        twoFactorEnabled: false,
        assignedAgentId: user.assignedAgentId ?? null,
      });

      return { accessToken, twoFactorRequired: false, pendingToken: null, user: mapAuthUser(user) };
    },

    verifyTwoFactorLogin: async (
      _: unknown,
      { pendingToken, code, isBackupCode }: { pendingToken: string; code: string; isBackupCode?: boolean },
      { ip, userAgent }: GqlContext,
    ) => {
      const ipAddress = clientIp(ip);
      const ua = userAgent ?? null;
      const pending = await verifyPendingToken(pendingToken);
      if (!pending) {
        throw new GraphQLError("Invalid or expired session. Please sign in again.", { extensions: { code: "UNAUTHENTICATED" } });
      }

      checkRateLimit(`2fa:${pending.sub}`, 5, 15 * 60 * 1000);

      const user = await User.findById(pending.sub);
      if (!user || !user.isActive) {
        throw new GraphQLError("User not found or inactive.", { extensions: { code: "UNAUTHENTICATED" } });
      }

      const tf = (user as any).twoFactor;
      if (!tf?.enabled || !tf.secret) {
        throw new GraphQLError("2FA is not enabled for this account.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const cleanCode = code.replace(/\s|-/g, "");

      const log2faFailure = (reason: string) =>
        logActivity({
          type: "AUTH_2FA_FAILED", category: "AUTH", messageKey: "auth.2faFailed",
          messageParams: { email: user.email, reason },
          fallbackText: `Failed 2FA verification for ${user.email} (${reason})`,
          actor: authActor(user), target: userTarget(user),
          companyId: user.companyId ?? null, ipAddress, userAgent: ua,
        });

      if (isBackupCode) {
        const { valid, remaining } = await verifyAndConsumeBackupCode(cleanCode, tf.backupCodes ?? []);
        if (!valid) {
          await log2faFailure("bad_backup_code");
          throw new GraphQLError("Invalid backup code.", { extensions: { code: "BAD_USER_INPUT" } });
        }
        user.set("twoFactor.backupCodes", remaining);
        await user.save();
      } else {
        const secret = decryptSecret(tf.secret);
        if (!(await verifyTotpCode(secret, cleanCode))) {
          await log2faFailure("bad_totp_code");
          throw new GraphQLError("Invalid or expired code.", { extensions: { code: "BAD_USER_INPUT" } });
        }
      }

      resetRateLimit(`2fa:${pending.sub}`);
      await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
      await logActivity({
        type: "AUTH_LOGIN", category: "AUTH", messageKey: "auth.login",
        messageParams: { email: user.email, method: isBackupCode ? "2fa_backup" : "2fa_totp" },
        fallbackText: `${user.name} signed in with 2FA`,
        actor: authActor(user), target: userTarget(user),
        companyId: user.companyId ?? null, ipAddress, userAgent: ua,
      });

      const accessToken = await signToken({
        sub: user._id as string,
        role: user.role,
        companyId: user.companyId ?? null,
        shortId: user.shortId ?? 0,
        twoFactorEnabled: true,
        assignedAgentId: user.assignedAgentId ?? null,
      });

      return { accessToken, twoFactorRequired: false, pendingToken: null, user: mapAuthUser(user) };
    },
  },
};
