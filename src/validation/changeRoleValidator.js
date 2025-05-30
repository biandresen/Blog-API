import { body } from "express-validator";
import { ROLES } from "../constants.js";

const changeRoleValidator = [
  body("role")
    .exists()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(", ")}`),
];

export default changeRoleValidator;
