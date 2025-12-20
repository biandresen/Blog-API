import { query } from "express-validator";
import { MAX_CHARS } from "../constants";

// Validation middleware
const searchParametersValidator = [
  query("searchParameters")
  .trim()
  .isString().withMessage("Search parameters can only include strings")
  .isLength({max: MAX_CHARS.SEARCH}).withMessage(`Search input is too long. Max ${MAX_CHARS.SEARCH} characters.`),
];

export default searchParametersValidator;
