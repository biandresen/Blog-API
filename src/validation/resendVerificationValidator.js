import { body } from "express-validator";

const resendVerificationValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .trim()
    .isEmail()
    .withMessage("Not a valid email address")
    .isLength({ min: 5, max: 100 })
    .withMessage("Email must be between 5-100 characters"),
];

export default resendVerificationValidator;