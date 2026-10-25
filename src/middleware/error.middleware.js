
import { UniqueConstraintError, ValidationError } from "sequelize";

// Global error handling middleware.
export const errorHandler = (error, req, res, next) => {
  console.error(error.errors || error);

  // Delegate to Express if the response has already started.
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Handle duplicate database values.
  if (error instanceof UniqueConstraintError) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }
  // Handle Sequelize validation errors.
  else if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.errors
      .map((item) => item.message)
      .join(", ");
  }

  // Ensure the status code is a valid HTTP error status.
  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    statusCode = 500;
  }

  // Hide internal server error details in production.
  if (statusCode >= 500) {
    message =
      process.env.NODE_ENV === "development"
        ? error.message || "Internal Server Error"
        : "Internal Server Error";
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
