import mongoose from "mongoose";

// Cache connection for serverless environments (Vercel)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 30000,   // 30 seconds (default 10)
      socketTimeoutMS: 45000,            // 45 seconds
      connectTimeoutMS: 30000,           // 30 seconds
      family: 4,                         // Force IPv4 (avoid IPv6 issues)
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    isConnected = mongoose.connection.readyState === 1;
    console.log("MongoDB Connected");
    console.log("MONGO URI:", process.env.MONGO_URI);
  } catch (err) {
    console.error("DB Error:", err);
    throw err; // Don't swallow the error
  }
};

export default connectDB;