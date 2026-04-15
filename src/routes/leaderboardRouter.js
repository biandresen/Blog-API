import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import leaderboardController from "../controllers/leaderboardController.js";
import { readHeavyLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// public
router.get("/users", readHeavyLimiter, asyncErrorHandler(leaderboardController.getLeaderboardUsers));

export default router;
