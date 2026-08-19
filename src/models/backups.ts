// Schemat rejestru wykonanych kopii zapasowych bazy wraz z rozmiarem, statusem i autorem

import { Schema, model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";

export type BackupStatus = "COMPLETE" | "FAILED";

const backupSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },

    publicId: { type: String, default: null },

    status: {
      type: String,
      enum: ["COMPLETE", "FAILED"],
      default: "COMPLETE",
    },
    errorMessage: { type: String, default: null },

    sizeBytes:        { type: Number, default: 0 },
    collectionsCount: { type: Number, default: 0 },
    docCount:         { type: Number, default: 0 },

    createdById:   { type: String, default: null },
    createdByName: { type: String, default: null },
  },
  { timestamps: true },
);

backupSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("backup");
});

backupSchema.index({ createdAt: -1 });

export const Backup = model("Backup", backupSchema);
