import { param } from "express-validator";

const idParamValidator = [
  param("id")
    .trim()
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

export default idParamValidator;