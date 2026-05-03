import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    console.log("MONGO", process.env.MONGO_URI);
    
  } catch (err) {
    console.log("DB Error:", err);
  }
};

export default connectDB;
