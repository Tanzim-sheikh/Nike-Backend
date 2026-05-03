const errorHandler = (err, req, res, next) => {
  console.log("Error:", err.message);

  // MongoDB duplicate key error (email already exists)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
      field: "email"
    });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors
    });
  }

  // Joi validation errors (from our validators)
  if (err.details && Array.isArray(err.details)) {
    const errors = err.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors
    });
  }

  // Token expired or invalid (for email verification)
  if (err.message.includes('token') || err.message.includes('Token')) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: "INVALID_TOKEN"
    });
  }

  // Email verification specific errors
  if (err.message.includes('verify') || err.message.includes('verified')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      requiresVerification: true
    });
  }
 
   if (!err || typeof err.message !== 'string') {
    return res.status(500).json({ success: false, message: "Unknown error" });
  }
  // Default error
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;