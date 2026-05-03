import { 
  registerService, 
  verifyEmailService, 
  resendVerificationService,
  loginService ,
  forgotPasswordService,
  resetPasswordService,
  getUserProfileService,
  updateAddressService
} from "./user.service.js";
import { 
  success, 
  created, 
  error 
} from "../../common/response.js";

export const registerUser = async (req, res, next) => {
  try {
    const user = await registerService(req.body);
    return created(res, user, "User registered successfully. Please check your email for verification link.");
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return error(res, "Verification token is required", 400);
    }

    const result = await verifyEmailService(token);
    return success(res, result, "Email verified successfully! You can now login.");
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return error(res, "Email is required", 400);
    }

    const result = await resendVerificationService(email);
    return success(res, result, "Verification email sent successfully");
  } catch (err) {
    if (err.message.includes("already verified")) {
      return error(res, err.message, 400);
    }
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginService(email, password);
    return success(res, user, "Login successful");
  } catch (err) {
    if (err.message.includes("verify your email")) {
      return error(res, err.message, 403, { requiresVerification: true });
    }
    next(err);
  }
};

// Forgot password controller
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, "Email is required", 400);
    const result = await forgotPasswordService(email);
    return success(res, result, "Reset link sent to your email");
  } catch (err) {
    next(err);
  }
};

// Reset password controller
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return error(res, "Token and new password are required", 400);
    }
    const result = await resetPasswordService(token, newPassword);
    return success(res, result, "Password updated successfully");
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfileService(req.user.userId);
    return success(res, user, "Profile fetched");
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { mobile, houseNo, addressLine, city, district, state, pincode } = req.body;
    const addressData = { mobile, houseNo, addressLine, city, district, state, pincode };
    const user = await updateAddressService(req.user.userId, addressData);
    return success(res, user, "Address updated");
  } catch (err) {
    next(err);
  }
};