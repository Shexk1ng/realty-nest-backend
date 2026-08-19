// Zapis przydziału zapytania do agenta wraz z trybem przydziału: automatycznym lub ręcznym

import { Schema, model } from "mongoose";
import { generateId } from "../utils/generateId.js";

const enquiryAllocationSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    enquiryId: { type: String, ref: "Enquiry", required: true, unique: true },
    agentId:   { type: String, ref: "User",    required: true },
    companyId: { type: String, ref: "Company", required: true },
    method:    { type: String, enum: ["AUTO", "MANUAL"], default: "AUTO" },
    allocatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false, _id: false },
);

enquiryAllocationSchema.index({ companyId: 1, allocatedAt: -1 });

export const EnquiryAllocation = model("EnquiryAllocation", enquiryAllocationSchema);
