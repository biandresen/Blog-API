import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import tagController from "../controllers/tagController.js";

const router = Router();

router.get("/", asyncErrorHandler(tagController.getAllTags));
router.get("/:id", asyncErrorHandler(tagController.getTagById));

export default router;
