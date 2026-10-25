import { validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return errorResponse(
    res,
    422,
    "Validation failed",
    errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  );
};
