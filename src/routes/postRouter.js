import { Router } from "express";
import postController from "../controllers/postController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import newPostValidator from "../validation/newPostValidation.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/", asyncErrorHandler(postController.getAllPosts));
router.get("/:id", asyncErrorHandler(postController.getPost));
router.post("/", isAuthenticated, newPostValidator, asyncErrorHandler(postController.createPost));

export default router;
