import { validationResult } from "express-validator";
import CustomError from "../utils/CustomError.js";

function checkValidation(req, res, next) {
  const validationErrors = validationResult(req);

  if (validationErrors.isEmpty()) return next();

  const detailedErrors = validationErrors.array();

  // Log full error details in development
  if (process.env.NODE_ENV === "development") {
    console.error("Validation errors:", detailedErrors);
  }

  // Send clean version to client
  const errors = detailedErrors.map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return next(new CustomError(400, "Validation failed", errors));
}

export default checkValidation;
