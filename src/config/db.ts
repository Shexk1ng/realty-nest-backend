// Nawiązuje połączenie z MongoDB i raportuje zmiany jego stanu

import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

mongoose.set("autoIndex", process.env.NODE_ENV !== "production");

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    logger.success(`MongoDB Connected`);
  } catch (err) {
    logger.error(`Database Error: ${(err as Error).message}`);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => logger.error(`MongoDB connection error: ${err.message}`));
  mongoose.connection.on("disconnected", () => logger.error("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => logger.success("MongoDB reconnected"));
};
