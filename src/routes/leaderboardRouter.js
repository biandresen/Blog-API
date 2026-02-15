import { Router } from "express";
import registerUserValidator from "../validation/registerValidator.js";
import loginUserValidator from "../validation/loginValidator.js";
import authController from "../controllers/authController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import checkValidation from "../middleware/checkValidation.js";
import resetPasswordValidator from "../validation/resetPasswordValidator.js";
import updatePasswordValidator from "../validation/updatePasswordValidator.js";
import { authLimiter, registerLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// router.get("/summary", )

export default router