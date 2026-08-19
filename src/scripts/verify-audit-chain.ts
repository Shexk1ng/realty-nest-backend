// CLI script that verifies the audit log's hash chain.

import dotenv from "dotenv";
import dns from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { ActivityLog } from "../models/logs.js";
import { verifyAuditChain } from "../utils/auditChain.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

async function main() {
  await connectDB();
  const result = await verifyAuditChain(ActivityLog as never);

  console.log("\n──────────── AUDIT CHAIN VERIFICATION ────────────");
  console.log(`Entries checked : ${result.total}`);
  console.log(`Checked at      : ${result.checkedAt}`);
  if (result.ok) {
    console.log("Status          : ✅ INTACT — every entry verified");
  } else {
    console.log(`Status          : ❌ BROKEN at seq ${result.brokenAtSeq}`);
    console.log(`Reason          : ${result.reason}`);
  }
  console.log("──────────────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error("Verification failed to run:", err);
  process.exit(2);
});
