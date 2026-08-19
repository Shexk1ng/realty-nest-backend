// Liczniki sekwencji nadające kolejne numery porządkowe rekordom poszczególnych encji

import { Schema, model } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model("Counter", counterSchema);

export async function nextSeq(entity: string): Promise<number> {
  const result = await Counter.findByIdAndUpdate(
    entity,
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return result!.seq;
}
