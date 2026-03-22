import { body } from "express-validator";

const ALLOWED_CATEGORIES = ["profanity", "insult", "sexual", "slur", "other"];

const moderationTermUpdateValidator = [
  body("term")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("term cannot be empty")
    .isString()
    .withMessage("term must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("term must be between 1 and 100 characters"),

  body("category")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("category must be a string")
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean")
    .toBoolean(),
];

export default moderationTermUpdateValidator;