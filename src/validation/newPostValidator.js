import { body } from "express-validator";

const newPostValidator = [
  body("title").notEmpty().withMessage("Title cannot be empty").trim().isLength({ max: 64 }),

  body("body").notEmpty().withMessage("Body cannot be empty").trim(),

  body("tags")
    .optional()
    .isArray({ min: 0 })
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every((tag) => typeof tag === "string");
    })
    .withMessage("Tags must be an array of non-empty strings"),

  body("published").optional().isBoolean().withMessage("Published must be a boolean").toBoolean(),
];

export default newPostValidator;
