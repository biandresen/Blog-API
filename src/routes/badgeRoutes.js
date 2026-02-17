import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import badgeController from "../controllers/badgeController.js";

const router = Router();

router.get("/me/history", isAuthenticated, asyncErrorHandler(badgeController.getMyBadgeHistory));
router.get("/me/current", isAuthenticated, asyncErrorHandler(badgeController.getMyCurrentBadges));

export default router;
