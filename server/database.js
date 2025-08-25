import mongoose from "mongoose";
import logger from "./utils/logging.js";

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.success("✅ MongoDB connected successfully!");
    } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }
}