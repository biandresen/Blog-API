import { query } from "express-validator";

const searchFiltersValidator = [
  query("title").optional().isBoolean().toBoolean(),
  query("body").optional().isBoolean().toBoolean(),
  query("comments").optional().isBoolean().toBoolean(),
  query("tags").optional().isBoolean().toBoolean(),
];

export default searchFiltersValidator;