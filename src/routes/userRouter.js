import { Router } from "express";
import postController from "../controllers/postController.js";
import userController from "../controllers/userController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import updateUserValidator from "../validation/updateUserValidator.js";
import isAdmin from "../middleware/isAdmin.js";
import changeRoleValidator from "../validation/changeRoleValidator.js";
import isSelfOrAdmin from "../middleware/isSelfOrAdmin.js";
import queryParametersValidator from "../validation/queryParametersValidator.js";
import checkValidation from "../middleware/checkValidation.js";

const router = Router();

router.get("/:id", isAuthenticated, asyncErrorHandler(userController.getUserProfile));

router.patch(
  "/:id",
  isAuthenticated,
  isSelfOrAdmin,
  updateUserValidator,
  checkValidation,
  asyncErrorHandler(userController.updateUserProfile)
);

router.patch(
  "/:id/role",
  isAuthenticated,
  isAdmin,
  changeRoleValidator,
  checkValidation,
  asyncErrorHandler(userController.changeUserRole)
);

router.patch("/:id/reactivate", isAuthenticated, isAdmin, asyncErrorHandler(userController.reactivateUser));

router.delete("/:id", isAuthenticated, isSelfOrAdmin, asyncErrorHandler(userController.deleteUser));

router.get(
  "/:id/posts",
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(postController.getAllPostsFromUser)
);

export default router;
