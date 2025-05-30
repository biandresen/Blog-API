import { body } from "express-validator";
import userService from "../services/userService.js";

const registerUserValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username cannot be empty")
    .trim()
    .isLength({ min: 3, max: 16 })
    .withMessage("Username must be between 3 and 16 characters")
    .custom(async (value) => {
      const user = await userService.getUserByUsername(value);
      if (user) {
        throw new Error("Username already exists");
      }
    }),

  body("email")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .trim()
    .isEmail()
    .withMessage("Not a valid email address")
    .isLength({ min: 5, max: 32 })
    .withMessage("Email must be between 5-32 characters")
    .custom(async (value) => {
      const user = await userService.getUserByEmail(value);
      if (user) {
        throw new Error("A user already exists with this email address");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isStrongPassword()
    .withMessage("Password must include at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol"),

  body("passwordConfirmation")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export default registerUserValidator;
