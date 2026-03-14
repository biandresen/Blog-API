import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import badgeController from "../controllers/badgeController.js";
import { readHeavyLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.get("/me/history", readHeavyLimiter, isAuthenticated, asyncErrorHandler(badgeController.getMyBadgeHistory));
router.get("/me/current", readHeavyLimiter, isAuthenticated, asyncErrorHandler(badgeController.getMyCurrentBadges));

export default router;
