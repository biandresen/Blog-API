import { Router } from "express";
import postController from "../controllers/postController.js";
import userController from "../controllers/userController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import updateUserValidator from "../validation/updateUserValidation.js";

const router = Router();

router.get("/:id", isAuthenticated, asyncErrorHandler(userController.getUserProfile));
router.patch(
  "/:id",
  isAuthenticated,
  updateUserValidator,
  asyncErrorHandler(userController.updateUserProfile)
);
router.get("/:id/posts", asyncErrorHandler(postController.getAllPostsFromUser));

export default router;
