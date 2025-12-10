import { body } from "express-validator";

const updatePostValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title cannot be empty")
    .trim()
    .isLength({ max: 64 })
    .withMessage("Max characters in title is 64"),

  body("body")
    .notEmpty()
    .withMessage("Body cannot be empty")
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Max characters in title is 2000"),

  body("tags")
    .isArray({ min: 0 })
    .withMessage("Tags must be an array")
    .optional()
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every((tag) => typeof tag === "string");
    })
    .withMessage("Tags must be an array")
    .isLength({ max: 200 })
    .withMessage("Max characters in title is 200"),

  body("published").optional().isBoolean().withMessage("Published must be a boolean").toBoolean(),
];

export default updatePostValidator;
