import { Router } from "express";
import postController from "../controllers/postController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import newPostValidator from "../validation/newPostValidation.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import updatePostValidator from "../validation/updatePostValidation.js";
import isAuthorOrAdmin from "../middleware/isAuthorOrAdmin.js";

const router = Router();

router.get("/", asyncErrorHandler(postController.getAllPosts));
router.get("/:id", asyncErrorHandler(postController.getPost));
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorOrAdmin,
  updatePostValidator,
  asyncErrorHandler(postController.updatePost)
);
router.delete("/:id", isAuthenticated, isAuthorOrAdmin, asyncErrorHandler(postController.deletePost));
router.post("/", isAuthenticated, newPostValidator, asyncErrorHandler(postController.createPost));

export default router;
