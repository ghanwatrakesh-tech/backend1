// Error Handler Middleware with comprehensive error handling
const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.message);

  // Default values
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorType = "SERVER_ERROR";

  // File upload errors
  if (err.message.includes("Only PDF")) {
    statusCode = 400;
    message = err.message;
    errorType = "INVALID_FILE_TYPE";
    return res.status(statusCode).json({ 
      success: false, 
      message, 
      errorType,
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = "File size must be less than 2MB";
    errorType = "FILE_TOO_LARGE";
    return res.status(statusCode).json({ 
      success: false, 
      message, 
      errorType,
      timestamp: new Date().toISOString()
    });
  }

  // Authentication errors
  if (err.message.includes("Unauthorized") || err.message.includes("not authorized")) {
    statusCode = 401;
    message = "Unauthorized - Please login";
    errorType = "UNAUTHORIZED";
  }

  // Validation errors
  if (err.message.includes("required") || err.message.includes("invalid")) {
    statusCode = 400;
    message = err.message;
    errorType = "VALIDATION_ERROR";
  }

  // Resource not found errors
  if (err.message.includes("not found") || err.statusCode === 404) {
    statusCode = 404;
    message = err.message || "Resource not found";
    errorType = "NOT_FOUND";
  }

  // MongoDB/Database errors
  if (err.name === 'MongoError' || err.name === 'ValidationError') {
    statusCode = 400;
    message = "Database error: " + (err.message || "Invalid data");
    errorType = "DATABASE_ERROR";
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.message.includes("token")) {
    statusCode = 401;
    message = "Invalid or expired token";
    errorType = "INVALID_TOKEN";
  }

  // Permission errors
  if (err.message.includes("Admin") || err.message.includes("permission")) {
    statusCode = 403;
    message = "Insufficient permissions";
    errorType = "FORBIDDEN";
  }

  res.status(statusCode).json({
    success: false,
    message: message || err.message,
    errorType,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;