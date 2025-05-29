import { Router } from "express";
import postController from "../controllers/postController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import newPostValidator from "../validation/newPostValidation.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import updatePostValidator from "../validation/updatePostValidation.js";
import isAuthorOrAdmin from "../middleware/isAuthorOrAdmin.js";
import isAdmin from "../middleware/isAdmin.js";

const router = Router();

router.get("/drafts", isAuthenticated, asyncErrorHandler(postController.getAllDraftsForCurrentUser));
router.get("/drafts/all", isAuthenticated, isAdmin, asyncErrorHandler(postController.getAllDrafts));
router.get("/:id", asyncErrorHandler(postController.getPost));
router.get("/", asyncErrorHandler(postController.getAllPosts));
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorOrAdmin,
  updatePostValidator,
  asyncErrorHandler(postController.updatePost)
);
router.post("/", isAuthenticated, newPostValidator, asyncErrorHandler(postController.createPost));
router.delete("/:id", isAuthenticated, isAuthorOrAdmin, asyncErrorHandler(postController.deletePost));

export default router;
