import { body } from "express-validator";

const updatePostValidator = [
  body("title").notEmpty().withMessage("Title cannot be empty").trim().isLength({ max: 64 }),

  body("body").notEmpty().withMessage("Body cannot be empty").trim(),

  body("tags")
    .isArray({ min: 0 })
    .withMessage("Tags must be an array")
    .optional()
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every((tag) => typeof tag === "string" && tag.trim().length > 0);
    })
    .withMessage("Tags must be an array of non-empty strings"),

  body("published").optional().isBoolean().withMessage("Published must be a boolean").toBoolean(),
];

export default updatePostValidator;
