import { body } from "express-validator";
import userService from "../services/userService.js";

const resetPasswordValidator = [
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
      if (!user) {
        throw new Error("That email has no user");
      }
      return true;
    }),
];

export default resetPasswordValidator;
