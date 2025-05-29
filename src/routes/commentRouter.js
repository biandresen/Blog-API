import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isCommentAuthorOrAdmin from "../middleware/isCommentAuthorOrAdmin.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import commentController from "../controllers/commentController.js";

const router = Router();

router.delete(
  "/:id",
  isAuthenticated,
  isCommentAuthorOrAdmin,
  asyncErrorHandler(commentController.deleteComment)
);

export default router;
