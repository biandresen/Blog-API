import { Router } from "express";
import postController from "../controllers/postController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import newPostValidator from "../validation/newPostValidation.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import updatePostValidator from "../validation/updatePostValidation.js";
import isPostAuthorOrAdmin from "../middleware/isPostAuthorOrAdmin.js";
import isAdmin from "../middleware/isAdmin.js";
import newCommentValidator from "../validation/newCommentValidation.js";
import commentController from "../controllers/commentController.js";

const router = Router();

router.get("/drafts", isAuthenticated, asyncErrorHandler(postController.getAllDraftsForCurrentUser));
router.get("/drafts/all", isAuthenticated, isAdmin, asyncErrorHandler(postController.getAllDrafts));
router.get("/:id", asyncErrorHandler(postController.getPost));
router.get("/", asyncErrorHandler(postController.getAllPosts));
router.patch(
  "/:id/publish",
  isAuthenticated,
  isPostAuthorOrAdmin,
  asyncErrorHandler(postController.publishDraft)
);
router.patch(
  "/:id",
  isAuthenticated,
  isPostAuthorOrAdmin,
  updatePostValidator,
  asyncErrorHandler(postController.updatePost)
);
router.post(
  "/:id/comments",
  isAuthenticated,
  newCommentValidator,
  asyncErrorHandler(commentController.createComment)
);
router.get("/:id/comments", asyncErrorHandler(commentController.getAllCommentsFromPost));
router.post("/", isAuthenticated, newPostValidator, asyncErrorHandler(postController.createPost));
router.delete("/:id", isAuthenticated, isPostAuthorOrAdmin, asyncErrorHandler(postController.deletePost));

export default router;
