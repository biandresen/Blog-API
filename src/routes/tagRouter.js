import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import tagController from "../controllers/tagController.js";

const router = Router();

router.get("/", asyncErrorHandler(tagController.getAllTags));

export default router;
