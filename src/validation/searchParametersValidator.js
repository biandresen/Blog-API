import { query } from "express-validator";

// Validation middleware
const searchParametersValidator = [
  query("searchParameters")
    .trim()
    .escape()
    .isString()
    .withMessage("Search parameters can only include strings"),

  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100"),

  query("sort").optional().isIn(["asc", "desc"]).withMessage("sort must be 'asc' or 'desc'"),
];

export default searchParametersValidator;
