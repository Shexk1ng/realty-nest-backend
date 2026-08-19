// Zrzut bazy i rejestr wykonanych kopii zapasowych, dostępne wyłącznie dla administratora platformy

import mongoose from "mongoose";
import { GraphQLError } from "graphql";
import { Backup } from "../../../models/backups.js";
import { User } from "../../../models/users.js";
import type { GqlContext } from "../../../types/context.js";
import type { TokenPayload } from "../../../utils/jwt.js";
import { sanitizeScalar } from "../../../utils/validate.js";

function requireSystemAdmin(user: GqlContext["user"]): TokenPayload {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  if (user.role !== "SYSTEM_ADMIN") {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
  return user;
}

const EXCLUDED_COLLECTIONS = new Set(["activitylogs", "counters"]);

function mapBackup(doc: any) {
  return {
    id: doc._id,
    shortId: doc.shortId ?? null,
    publicId: doc.publicId ?? null,
    status: doc.status,
    errorMessage: doc.errorMessage ?? null,
    sizeBytes: doc.sizeBytes ?? 0,
    collectionsCount: doc.collectionsCount ?? 0,
    docCount: doc.docCount ?? 0,
    createdById: doc.createdById ?? null,
    createdByName: doc.createdByName ?? null,
    createdAt: doc.createdAt?.toISOString?.() ?? null,
  };
}

export const backupResolvers = {
  Query: {
    async getBackups(_p: unknown, _a: unknown, ctx: GqlContext) {
      requireSystemAdmin(ctx.user);
      const docs = await Backup.find({}).sort({ createdAt: -1 }).limit(100).lean();
      return docs.map(mapBackup);
    },

    async getBackupById(_p: unknown, args: { id: string }, ctx: GqlContext) {
      requireSystemAdmin(ctx.user);
      const doc = await Backup.findById(sanitizeScalar(args.id, "id")).lean();
      return doc ? mapBackup(doc) : null;
    },

    async dumpDatabase(_p: unknown, _a: unknown, ctx: GqlContext) {
      requireSystemAdmin(ctx.user);
      const db = mongoose.connection.db;
      if (!db) throw new GraphQLError("Database unavailable", { extensions: { code: "INTERNAL" } });

      const collections = await db.listCollections().toArray();
      const dump: Record<string, unknown[]> = {};
      for (const { name } of collections) {
        if (EXCLUDED_COLLECTIONS.has(name.toLowerCase())) continue;
        dump[name] = await db.collection(name).find({}).toArray();
      }
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        collections: dump,
      });
    },
  },

  Mutation: {
    async recordBackup(
      _p: unknown,
      args: {
        publicId?: string | null;
        sizeBytes: number;
        collectionsCount: number;
        docCount: number;
        status?: string | null;
        errorMessage?: string | null;
      },
      ctx: GqlContext,
    ) {
      const caller = requireSystemAdmin(ctx.user);
      const author = await User.findById(caller.sub).lean();

      const status = args.status === "FAILED" ? "FAILED" : "COMPLETE";
      const doc = new Backup({
        publicId: args.publicId ? sanitizeScalar(args.publicId, "publicId") : null,
        status,
        errorMessage: args.errorMessage ? sanitizeScalar(args.errorMessage, "errorMessage") : null,
        sizeBytes: Math.max(0, Number(args.sizeBytes) || 0),
        collectionsCount: Math.max(0, Number(args.collectionsCount) || 0),
        docCount: Math.max(0, Number(args.docCount) || 0),
        createdById: caller.sub,
        createdByName: (author as { name?: string } | null)?.name ?? null,
      });
      await doc.save();
      return mapBackup(doc.toObject());
    },
  },
};
