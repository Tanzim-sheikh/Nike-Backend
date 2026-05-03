import jwt from "jsonwebtoken";
import { error } from "../common/response.js";

export const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "No token provided", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return error(res, "Access denied: Admin only", 403);
    }
    req.admin = decoded; // { adminId, email, role }
    next();
  } catch (err) {
    return error(res, "Invalid or expired token", 401);
  }
};