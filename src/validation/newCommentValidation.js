import { body } from "express-validator";

const newCommentValidator = [
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Comment is too long"),
];

export default newCommentValidator;
