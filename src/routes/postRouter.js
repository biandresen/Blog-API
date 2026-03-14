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
import { readHeavyLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.get(
  "/search",
  readHeavyLimiter,
  searchParametersValidator,
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(postController.searchPosts)
);

router.get("/popular", asyncErrorHandler(postController.getPopularPosts));

router.get("/random", asyncErrorHandler(postController.getRandomPost));

router.get("/daily", asyncErrorHandler(postController.getDailyPost));

router.post(
  "/daily/view",
  readHeavyLimiter,
  isAuthenticated,
  asyncErrorHandler(postController.recordDailyJokeView)
);


router.get(
  "/drafts",
  readHeavyLimiter,
  isAuthenticated,
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(postController.getAllDraftsFromCurrentUser)
);

router.get(
  "/drafts/all",
  readHeavyLimiter,
  isAuthenticated,
  isAdmin,
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(postController.getAllDrafts)
);

router.get("/:id",readHeavyLimiter, asyncErrorHandler(postController.getPost));

router.get("/",readHeavyLimiter, queryParametersValidator, checkValidation, asyncErrorHandler(postController.getAllPosts));

router.patch(
  "/:id/publish",
  readHeavyLimiter,
  isAuthenticated,
  isPostAuthorOrAdmin,
  asyncErrorHandler(postController.publishDraft)
);

router.patch(
  "/:id",
  readHeavyLimiter,
  isAuthenticated,
  isPostAuthorOrAdmin,
  updatePostValidator,
  checkValidation,
  asyncErrorHandler(postController.updatePost)
);

router.post("/:id/like", readHeavyLimiter, isAuthenticated, asyncErrorHandler(postController.toggleLike));

router.post(
  "/:id/comments",
  readHeavyLimiter,
  isAuthenticated,
  newCommentValidator,
  checkValidation,
  asyncErrorHandler(commentController.createComment)
);

router.get(
  "/:id/comments",
  readHeavyLimiter,
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(commentController.getAllCommentsFromPost)
);

router.post(
  "/",
  readHeavyLimiter,
  isAuthenticated,
  newPostValidator,
  checkValidation,
  asyncErrorHandler(postController.createPost)
);

router.delete("/:id", readHeavyLimiter, isAuthenticated, isPostAuthorOrAdmin, asyncErrorHandler(postController.deletePost));

export default router;
