import { body } from "express-validator";
import { ROLES } from "../constants.js";

const updateUserRoleValidator = [
  body("role")
    .optional()
    .custom((value, { req }) => {
      const currentUser = req.user;
      const isAdmin = currentUser?.role === ROLES.ADMIN_ROLE;

      if (!isAdmin) {
        throw new Error("Only admins can change user roles");
      }

      if (![ROLES.USER_ROLE, ROLES.ADMIN_ROLE].includes(value)) {
        throw new Error(`Role must be either '${ROLES.USER_ROLE}' or '${ROLES.ADMIN_ROLE}'`);
      }

      return true;
    }),
];

export default updateUserRoleValidator;
