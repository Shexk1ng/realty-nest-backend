// Zakłada konto administratora platformy i przykładowe rekordy startowe dla pulpitu

import dotenv from "dotenv";
import dns from "node:dns";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/users.js";
import { Company } from "../models/companies.js";
import { Property } from "../models/properties.js";
import { Contact } from "../models/contacts.js";
import { CalendarEvent } from "../models/events.js";
import { Enquiry } from "../models/enquiries.js";
import { PipelineLead } from "../models/leads.js";
import { Commission } from "../models/commissions.js";
import { Document } from "../models/documents.js";
import { Campaign } from "../models/campaigns.js";
import { ActivityLog } from "../models/logs.js";
import { connectDB } from "../config/db.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const EMAIL      = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const PASSWORD   = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
const FIRST_NAME = process.env.SEED_ADMIN_FIRST_NAME ?? "Platform";
const LAST_NAME  = process.env.SEED_ADMIN_LAST_NAME ?? "Admin";

async function saveAs(doc: any, actor: any): Promise<any> {
  doc.$locals = doc.$locals ?? {};
  doc.$locals.actor = actor;
  return doc.save();
}

async function seed() {
  await connectDB();

  const existing = await User.findOne({ role: "SYSTEM_ADMIN" });
  if (existing) {
    console.error(`\n❌  System admin already exists.\n    Email: ${existing.email}\n    role:  ${existing.role}\n    id:    #${existing.shortId}\n`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const platform = await new Company({
    name: "Realty Nest",
    domain: "realtynest.com",
    type: "PLATFORM",
    isActive: true,
    settings: { website: "https://realtynest.com", email: "contact@realtynest.com" },
  }).save();

  const hashed = await bcrypt.hash(PASSWORD, 12);
  const admin = await new User({
    email: EMAIL,
    password: hashed,
    name: `${FIRST_NAME} ${LAST_NAME}`,
    role: "SYSTEM_ADMIN",
    companyId: platform._id,
    isActive: true,
    profile: { firstName: FIRST_NAME, lastName: LAST_NAME, jobTitle: "Platform Administrator" },
  }).save();

  const cid = platform._id as string;
  const aid = admin._id as string;

  const sampleProperty = await saveAs(new Property({
    title: "Realty Nest HQ — sample listing",
    price: 1_000_000,
    location: "Warsaw, Poland",
    status: "ACTIVE",
    description: "Placeholder property to show the dashboard tables are wired up.",
    companyId: cid,
    agentId: aid,
  }), admin);

  const sampleContact = await saveAs(new Contact({
    name: "Sample Client",
    email: "client@example.com",
    phone: "+48 000 000 000",
    role: "Buyer",
    kind: "CLIENT",
    companyId: cid,
    ownerId: aid,
  }), admin);

  await saveAs(new Enquiry({
    name: "Sample Enquiry",
    email: "lead@example.com",
    phone: "+48 111 222 333",
    propertyInterest: "Any apartment",
    location: "Warsaw",
    budget: 500_000,
    source: "DIRECT",
    priority: "MEDIUM",
    status: "NEW",
    note: "Auto-created by seed-admin.",
    companyId: cid,
    agentId: aid,
    propertyId: sampleProperty._id,
  }), admin);

  await saveAs(new PipelineLead({
    title: "Sample lead — HQ listing",
    stage: "NEW",
    source: "Direct",
    estValue: 1_000_000,
    companyId: cid,
    agentId: aid,
    contactId: sampleContact._id,
    propertyId: sampleProperty._id,
  }), admin);

  await saveAs(new Commission({
    salePrice: 1_000_000,
    rate: 2.0,
    amount: 20_000,
    status: "PENDING",
    dealDate: new Date(),
    paidDate: null,
    clientName: "Sample Client",
    companyId: cid,
    agentId: aid,
    propertyId: sampleProperty._id,
  }), admin);

  await saveAs(new Document({
    name: "Welcome to Realty Nest.pdf",
    fileType: "PDF",
    category: "OTHER",
    sizeBytes: 102_400,
    companyId: cid,
    uploadedById: aid,
    propertyId: null,
  }), admin);

  await saveAs(new Campaign({
    name: "Launch — Brand awareness",
    channel: "SOCIAL",
    status: "DRAFT",
    budget: 1_000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    leads: 0,
    startDate: new Date(),
    endDate: null,
    companyId: cid,
    ownerId: aid,
    propertyId: null,
  }), admin);

  await saveAs(new CalendarEvent({
    title: "Welcome call",
    kind: "CALL",
    startAt: new Date(Date.now() + 24 * 3_600_000),
    endAt: new Date(Date.now() + 24 * 3_600_000 + 30 * 60_000),
    location: null,
    companyId: cid,
    agentId: aid,
    propertyId: sampleProperty._id,
    contactId: sampleContact._id,
  }), admin);

  const logCount = await ActivityLog.countDocuments();
  console.log(`
✅  Platform bootstrapped!

  Platform company: ${platform.name}  (#${platform.shortId}, id: ${platform._id})

  System Admin:
    email:     ${admin.email}
    password:  ${PASSWORD}    ← change this immediately
    role:      ${admin.role}
    companyId: ${admin.companyId}
    shortId:   #${admin.shortId}
    id:        ${admin._id}

  Starter data created (1 property, 1 contact, 1 enquiry, 1 lead, 1 commission,
  1 document, 1 campaign, 1 calendar event) — all linked to the admin so the
  dashboard has something to show on first login.

  Activity logs auto-generated: ${logCount}
`);

  await mongoose.disconnect();
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
