import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import hallOfFameController from "../controllers/hallOfFameController.js";

const router = Router();

// public
router.get("/users", asyncErrorHandler(hallOfFameController.getHallOfFameUsers));

export default router;