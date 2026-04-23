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
      if (existing && existing.id !== Number(req.user?.id)) {
        throw new Error("Username already exists");
      }
      return true;
    }),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Not a valid email address")
    .isLength({ min: 5, max: 64 })
    .withMessage("Email must be between 5 and 64 characters")
    .custom(async (value, { req }) => {
      const normalizedEmail = value.trim().toLowerCase();

      const userByEmail = await userService.getUserByEmail(normalizedEmail);
      if (userByEmail && userByEmail.id !== Number(req.user?.id)) {
        throw new Error("A user already exists with this email address");
      }

      if (typeof userService.getUserByPendingEmail === "function") {
        const userByPendingEmail = await userService.getUserByPendingEmail(normalizedEmail);
        if (userByPendingEmail && userByPendingEmail.id !== Number(req.user?.id)) {
          throw new Error("A user already exists with this email address");
        }
      }

      return true;
    }),

  body("currentPassword")
    .optional()
    .isString()
    .withMessage("Current password must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Current password is required"),

  body("password")
    .optional()
    .isStrongPassword()
    .withMessage("Password must include at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol"),

  body("preferredLanguage").optional().isIn(["NO", "EN"]).withMessage("preferredLanguage must be NO or EN"),
];

export default updateUserValidator;
