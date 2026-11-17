import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.mongoURI) throw new Error("mongoURI is not configured");
    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(process.env.mongoURI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};
