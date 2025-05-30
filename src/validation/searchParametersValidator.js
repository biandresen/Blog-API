import { query } from "express-validator";

// Validation middleware
const searchParametersValidator = [
  query("searchParameters").trim().isString().withMessage("Search parameters can only include strings"),
];

export default searchParametersValidator;
