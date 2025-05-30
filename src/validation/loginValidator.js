import { body } from "express-validator";

const loginValidator = [
  body("userInput")
    .notEmpty()
    .withMessage("Username or email is required")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Must be a valid username or email"),

  body("password").notEmpty().withMessage("Password is required"),
];

export default loginValidator;
