import { Router } from "express";
import postController from "../controllers/postController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

const router = Router();

router.get("/", asyncErrorHandler(postController.getAllPosts));
router.get("/:id", asyncErrorHandler(postController.getPost));

export default router;
