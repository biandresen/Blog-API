import { Router } from "express";
import postController from "../controllers/postController.js";
import userController from "../controllers/userController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/:id", isAuthenticated, asyncErrorHandler(userController.getUserProfile));
router.get("/:id/posts", asyncErrorHandler(postController.getAllPostsFromUser));

export default router;
