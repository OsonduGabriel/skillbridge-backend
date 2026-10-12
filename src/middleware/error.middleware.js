
import { UniqueConstraintError, ValidationError } from "sequelize";

// Global error handling middleware
export const errorHandler = (error, req, res, next) => {
  console.error(error.errors || error);

  // If the response has already started, delegate to Express.
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Check duplicate values before general validation errors.
  if (error instanceof UniqueConstraintError) {
    statusCode = 409;
    message = "A record with this value already exists.";
  } else if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.errors
      .map((item) => item.message)
      .join(", ");
  }

  // Hide unexpected internal errors in production.
  if (statusCode >= 500) {
    message = process.env.NODE_ENV === "development" ? error.message || "Internal Server Error"   : "Internal Server Error";
  }

  const response = {
    success: false,
    message,
  };

  // Include stack traces only during development.
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};
