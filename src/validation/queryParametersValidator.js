import { query } from "express-validator";

// Validation middleware
const queryParametersValidator = [
  query("page").optional().trim().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(),

  ,
  query("limit")
    .optional()
    .trim()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100")
    .toInt(),

  query("sort").optional().trim().isIn(["asc", "desc"]).withMessage("sort must be 'asc' or 'desc'"),
  query("tag").optional().trim().isString().withMessage("tags must be strings seperated by ',' or '+"),
];

export default queryParametersValidator;
