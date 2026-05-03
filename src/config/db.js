import mongoose from "mongoose";

// Cache connection for serverless environments (Vercel)
let cachedConnection = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 30000,   // 30 seconds (default 10)
      socketTimeoutMS: 45000,            // 45 seconds
      connectTimeoutMS: 30000,           // 30 seconds
      family: 4,                         // Force IPv4 (avoid IPv6 issues)
    };

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    cachedConnection = mongoose.connect(process.env.MONGO_URI, options);
    await cachedConnection;
    console.log("MongoDB Connected");
    return mongoose.connection;
  } catch (err) {
    cachedConnection = null;
    console.error("DB Error:", err);
    throw err; // Don't swallow the error
  }
};

export default connectDB;
