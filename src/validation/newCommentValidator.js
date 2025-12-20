import { body } from "express-validator";
import { MAX_CHARS } from "../constants";

const newCommentValidator = [
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ max: MAX_CHARS.COMMENT })
    .withMessage(`Comment is too long. Max ${MAX_CHARS.COMMENT} characters.`),
];

export default newCommentValidator;
