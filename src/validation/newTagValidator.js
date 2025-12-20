import { body } from "express-validator";
import tagService from "../services/tagService.js";
import { MAX_CHARS } from "../constants.js";

const newTagValidator = [
  body("tag")
    .trim()
    .notEmpty()
    .withMessage("Tag name cannot be empty")
    .isLength({ max: MAX_CHARS.TAGS })
    .withMessage(`Tag is too long. Max ${MAX_CHARS.TAGS} characters.`)
    .custom(async (value) => {
      const tagExists = await tagService.getTagByName(value.toLowerCase());
      if (tagExists) throw new Error("Tag already exists");
      return true;
    }),
];

export default newTagValidator;
