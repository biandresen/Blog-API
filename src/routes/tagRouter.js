import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import tagController from "../controllers/tagController.js";
import newTagValidator from "../validation/newTagValidator.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/", asyncErrorHandler(tagController.getAllTags));
router.get("/:id", asyncErrorHandler(tagController.getTagById));
router.post("/", isAuthenticated, newTagValidator, asyncErrorHandler(tagController.createTag));

export default router;
