export const success = (res, data, message = "Success", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const error = (res, message = "Error", status = 400, data = null) => {
  return res.status(status).json({
    success: false,
    message,
    data,
  });
};

// Specific response functions for common scenarios
export const created = (res, data, message = "Created successfully") => {
  return success(res, data, message, 201);
};

export const notFound = (res, message = "Resource not found") => {
  return error(res, message, 404);
};

export const unauthorized = (res, message = "Unauthorized") => {
  return error(res, message, 401);
};

export const forbidden = (res, message = "Forbidden") => {
  return error(res, message, 403);
};

export const validationError = (res, message = "Validation failed") => {
  return error(res, message, 422);
};

export const serverError = (res, message = "Internal server error") => {
  return error(res, message, 500);
};

// Email verification specific responses
export const emailNotVerified = (res, message = "Please verify your email first") => {
  return error(res, message, 403, { requiresVerification: true });
};

export const verificationSent = (res, message = "Verification email sent successfully") => {
  return success(res, null, message, 200);
};

export const alreadyVerified = (res, message = "Email already verified") => {
  return error(res, message, 400);
};