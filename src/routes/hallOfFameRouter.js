import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import hallOfFameController from "../controllers/hallOfFameController.js";
import { readHeavyLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// public
router.get("/users", readHeavyLimiter, asyncErrorHandler(hallOfFameController.getHallOfFameUsers));

export default router;