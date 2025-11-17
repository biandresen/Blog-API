import { body } from "express-validator";
import userService from "../services/userService.js";

const updateUserValidator = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 16 })
    .withMessage("Username must be between 3 and 16 characters")
    .custom(async (value, { req }) => {
      const existing = await userService.getUserByUsername(value);
      if (existing && existing.id !== Number(req?.params?.id)) {
        throw new Error("Username already exists");
      }
      return true;
    }),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Not a valid email address")
    .isLength({ min: 5, max: 32 })
    .withMessage("Email must be between 5 and 32 characters")
    .custom(async (value, { req }) => {
      const user = await userService.getUserByEmail(value);
      if (user && user.id !== Number(req?.params?.id)) {
        throw new Error("A user already exists with this email address");
      }
      return true;
    }),

  body("password")
    .optional()
    .isStrongPassword()
    .withMessage("Password must include at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol"),

  body("avatar").optional().isString().withMessage("Avatar must be a valid string URL"),
];

export default updateUserValidator;
