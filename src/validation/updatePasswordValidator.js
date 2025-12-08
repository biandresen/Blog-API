import { body } from "express-validator";

const updatePasswordValidator = [
  body("password")
    .optional()
    .isStrongPassword()
    .withMessage("Password must include at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol"),
];

export default updatePasswordValidator;
