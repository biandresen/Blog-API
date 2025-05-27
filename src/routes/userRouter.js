import { Router } from "express";
import postController from "../controllers/postController.js";
import userController from "../controllers/userController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import updateUserValidator from "../validation/updateUserValidation.js";
import isAdmin from "../middleware/isAdmin.js";
import changeRoleValidator from "../validation/changeRoleValidation.js";
import canAccessUser from "../middleware/canAccessUser.js";

const router = Router();

router.get("/:id", isAuthenticated, asyncErrorHandler(userController.getUserProfile));
router.patch(
  "/:id",
  isAuthenticated,
  canAccessUser,
  updateUserValidator,
  asyncErrorHandler(userController.updateUserProfile)
);
router.patch(
  "/:id/role",
  isAuthenticated,
  isAdmin,
  changeRoleValidator,
  asyncErrorHandler(userController.changeUserRole)
);
router.delete("/:id", isAuthenticated, canAccessUser, asyncErrorHandler(userController.deleteUser));
router.get("/:id/posts", asyncErrorHandler(postController.getAllPostsFromUser));

export default router;
