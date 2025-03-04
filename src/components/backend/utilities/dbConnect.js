import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Global cache to prevent multiple connections in dev mode
let cached = global.mongoose || { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn; // Return existing connection
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // Enables connection pooling
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB (default) connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

// Ensure caching works in hot reload (Next.js development mode)
if (process.env.NODE_ENV !== "production") {
  global.mongoose = cached;
}
