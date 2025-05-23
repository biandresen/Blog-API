import { Router } from "express";
import userController from "../controllers/userController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/:id", isAuthenticated, asyncErrorHandler(userController.getUserProfile));

export default router;
