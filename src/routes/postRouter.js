import { Router } from "express";
import postController from "../controllers/postController.js";
import commentController from "../controllers/commentController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isPostAuthorOrAdmin from "../middleware/isPostAuthorOrAdmin.js";
import isAdmin from "../middleware/isAdmin.js";
import updatePostValidator from "../validation/updatePostValidator.js";
import newPostValidator from "../validation/newPostValidator.js";
import newCommentValidator from "../validation/newCommentValidator.js";
import searchParametersValidator from "../validation/searchParametersValidator.js";
import queryParametersValidator from "../validation/queryParametersValidator.js";
import checkValidation from "../middleware/checkValidation.js";

const router = Router();

router.get(
  "/search",
  searchParametersValidator,
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(postController.searchPosts)
);

router.get("/drafts", isAuthenticated, asyncErrorHandler(postController.getAllDraftsForCurrentUser));

router.get(
  "/drafts/all",
  isAuthenticated,
  isAdmin,
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(postController.getAllDrafts)
);

router.get("/:id", asyncErrorHandler(postController.getPost));

router.get("/", queryParametersValidator, checkValidation, asyncErrorHandler(postController.getAllPosts));

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
  checkValidation,
  asyncErrorHandler(postController.updatePost)
);

router.post(
  "/:id/comments",
  isAuthenticated,
  newCommentValidator,
  checkValidation,
  asyncErrorHandler(commentController.createComment)
);

router.get(
  "/:id/comments",
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(commentController.getAllCommentsFromPost)
);

router.post(
  "/",
  isAuthenticated,
  newPostValidator,
  checkValidation,
  asyncErrorHandler(postController.createPost)
);

router.delete("/:id", isAuthenticated, isPostAuthorOrAdmin, asyncErrorHandler(postController.deletePost));

export default router;
