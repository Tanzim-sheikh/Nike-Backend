// src/modules/admin/admin.service.js
import Admin from "./admin.model.js";
import jwt from "jsonwebtoken";

export const adminLoginService = async (email, password, secretKey) => {
  // ✅ Pehle .env se secret key match karo
  const envSecret = process.env.ADMIN_SECRET_KEY;
  if (!envSecret || secretKey !== envSecret) {
    const error = new Error("Invalid secret key");
    error.status = 401;
    throw error;
  }

  // ✅ Ab database me admin find karo
  const admin = await Admin.findOne({ email });
  if (!admin) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  // ✅ Password verify karo
  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  // ✅ JWT token generate karo
  const token = jwt.sign(
    { adminId: admin._id, email: admin.email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  };
};