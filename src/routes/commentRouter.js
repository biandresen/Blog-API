import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isCommentAuthorOrAdmin from "../middleware/isCommentAuthorOrAdmin.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import commentController from "../controllers/commentController.js";
import newCommentValidator from "../validation/newCommentValidator.js";

const router = Router();

router.patch(
  "/:id",
  isAuthenticated,
  isCommentAuthorOrAdmin,
  newCommentValidator,
  asyncErrorHandler(commentController.editComment)
);
router.delete(
  "/:id",
  isAuthenticated,
  isCommentAuthorOrAdmin,
  asyncErrorHandler(commentController.deleteComment)
);

export default router;
