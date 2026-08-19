// Schemat prowizji od sprzedaży: stawka, kwota, status rozliczenia i data wypłaty

import { Schema, model, type Model } from "mongoose";
import { nextSeq } from "./counters.js";
import { generateId } from "../utils/generateId.js";
import { activityLogPlugin } from "./plugins/activity-log.js";

export type CommissionStatus = "PAID" | "PENDING" | "PROCESSING" | "DISPUTED";

const commissionSchema = new Schema(
  {
    _id: { type: String, default: generateId },
    shortId: { type: Number, unique: true },
    salePrice: { type: Schema.Types.Decimal128, required: true },
    rate: { type: Number, required: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    status: {
      type: String,
      enum: ["PAID", "PENDING", "PROCESSING", "DISPUTED"],
      default: "PENDING",
    },
    dealDate: { type: Date, required: true },
    paidDate: { type: Date, default: null },
    clientName: { type: String, default: null },
    invoiceNumber: { type: String, default: null },
    companyId: { type: String, ref: "Company", required: true },
    agentId: { type: String, ref: "User", default: null },
    propertyId: { type: String, ref: "Property", default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false },
);

commissionSchema.pre("save", async function () {
  if (this.isNew) this.shortId = await nextSeq("commission");
});

commissionSchema.plugin(activityLogPlugin, {
  entityName: "Commission",
  category: "COMMISSION",
  prefix: "COMMISSION",
  i18nBase: "log.commission",
  labelField: "clientName",
  refField: "commissionId",
  fieldEvents: {
    status: { type: "COMMISSION_UPDATED", messageKey: "log.commission.statusChanged" },
    isDeleted: { type: "COMMISSION_DELETED", messageKey: "log.commission.deleted" },
  },
});

commissionSchema.index({ companyId: 1, dealDate: -1 });
commissionSchema.index({ companyId: 1, agentId: 1 });

export const Commission: Model<any> = model("Commission", commissionSchema);
