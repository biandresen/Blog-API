import { body } from "express-validator";
import tagService from "../services/tagService.js";

const newTagValidator = [
  body("tag")
    .trim()
    .notEmpty()
    .withMessage("Tag name cannot be empty")
    .isLength({ min: 2, max: 32 })
    .withMessage("Tag name must be between 2 and 32 characters")
    .custom(async (value) => {
      const tagExists = await tagService.getTagByName(value.toLowerCase());
      if (tagExists) throw new Error("Tag already exists");
      return true;
    }),
];

export default newTagValidator;
