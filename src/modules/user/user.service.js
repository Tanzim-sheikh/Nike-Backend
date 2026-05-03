import User from "./user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../../utils/emailService.js";

export const registerService = async (data) => {
  // Check if email already exists
  const exist = await User.findOne({ email: data.email });
  if (exist) {
    const error = new Error("Email already registered");
    error.status = 400;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Token expiry (24 hours from now)
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);

  // Create user
  const user = await User.create({
    name: data.name,
    surname: data.surname,
    email: data.email,
    password: hashedPassword,
    verificationToken: verificationToken,
    tokenExpires: tokenExpires
  });

  // Send verification email
  await sendVerificationEmail(data.email, verificationToken);

  // Return user without sensitive data
  const { password, verificationToken: token, ...userWithoutSensitive } = user.toObject();
  return userWithoutSensitive;
};


// Verify email service
export const verifyEmailService = async (token) => {
  console.log('🔍 Verify Email Service - Token received:', token);
  
  if (!token) {
    console.log('❌ No token provided');
    const error = new Error("Verification token is required");
    error.status = 400;
    throw error;
  }

  // Find user with token
  const user = await User.findOne({ 
    verificationToken: token,
    tokenExpires: { $gt: new Date() } // Check if token not expired
  });

  console.log('🔍 User found with token:', user ? user.email : 'NO USER FOUND');

  if (!user) {
    console.log('❌ No user found with this token or token expired');
    const error = new Error("Invalid or expired verification token");
    error.status = 400;
    throw error;
  }

  // Update user as verified and clear token
  user.isVerified = true;
  user.verificationToken = undefined;
  user.tokenExpires = undefined;
  await user.save();

  console.log('✅ Email verified successfully for:', user.email);

  // Send welcome email after successful verification
  try {
    await sendWelcomeEmail(user.email, user.name);
    console.log('✅ Welcome email sent to:', user.email);
  } catch (emailError) {
    console.error('❌ Failed to send welcome email:', emailError);
    // Don't throw error here - verification was successful
  }

  return { 
    message: "Email verified successfully", 
    email: user.email,
    name: user.name 
  };
};


// Resend verification email service
export const resendVerificationService = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error("Email already verified");
    error.status = 400;
    throw error;
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);

  // Update user with new token
  user.verificationToken = verificationToken;
  user.tokenExpires = tokenExpires;
  await user.save();

  // Send new verification email
  await sendVerificationEmail(email, verificationToken);

  return { message: "Verification email sent successfully" };
};


// Login service - UPDATED WITH JWT
export const loginService = async (email, password) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  // Check if email is verified
  if (!user.isVerified) {
    const error = new Error("Please verify your email first. Check your inbox for verification link.");
    error.status = 403;
    error.requiresVerification = true;
    throw error;
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  console.log('🔐 Login service secret (first 6 chars):', process.env.JWT_SECRET?.trim()?.substring(0, 6));
  const token = jwt.sign(
    { 
      userId: user._id, 
      email: user.email,
      name: user.name 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN 
    }
  );

  // Return user with token
  const userResponse = {
    _id: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: token // JWT token added here
  };

  return userResponse;
};

// Forgot password – generate reset token and send email
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("No account found with this email");
    error.status = 404;
    throw error;
  }

  // Generate reset token (expires in 1 hour)
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send email
  await sendPasswordResetEmail(email, resetToken);
  return { message: "Password reset email sent" };
};

// Reset password – verify token and update password
export const resetPasswordService = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    const error = new Error("Invalid or expired reset token");
    error.status = 400;
    throw error;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return { message: "Password reset successful" };
};

export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select('-password -verificationToken -tokenExpires');
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user;
};

export const updateAddressService = async (userId, addressData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { address: addressData },
    { new: true, runValidators: true }
  ).select('-password -verificationToken -tokenExpires');
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user;
};