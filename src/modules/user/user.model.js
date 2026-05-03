import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    tokenExpires: { type: Date },
    resetPasswordToken: { type: String, default: undefined },
    resetTokenExpires: { type: Date, default: undefined },
    // ✅ Address field inside schema object
    address: {
      mobile: { type: String, default: '' },
      houseNo: { type: String, default: '' },
      addressLine: { type: String, default: '' },
      city: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
    }
  },
  { timestamps: true } // ✅ timestamps as second argument
);
const User = mongoose.model("User", userSchema);

export default User;