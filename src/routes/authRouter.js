import { Router } from "express";
import registerUserValidator from "../validation/registerValidation.js";
import authController from "../controllers/authController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

const router = Router();

router.post("/register", registerUserValidator, asyncErrorHandler(authController.registerUser));

export default router;
