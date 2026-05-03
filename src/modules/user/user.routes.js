import { Router } from "express";
import { 
  registerUser, 
  verifyEmail, 
  resendVerification,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateAddress
} from "./user.controller.js";
import validate from "../../middleware/validate.js";
import { registerSchema, loginSchema } from "./user.validator.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.get("/verify-email", verifyEmail); // Email verification route
router.post("/resend-verification", resendVerification); // Resend verification
router.post("/login", validate(loginSchema), loginUser); // Login route
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", authenticate,  getProfile);
router.put("/address", authenticate, updateAddress);

export default router;