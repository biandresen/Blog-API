import { Router } from "express";
import registerUserValidator from "../validation/registerValidation.js";
import loginUserValidator from "../validation/loginValidation.js";
import authController from "../controllers/authController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

const router = Router();

router.post("/register", registerUserValidator, asyncErrorHandler(authController.registerUser));
router.post("/login", loginUserValidator, asyncErrorHandler(authController.loginUser));

export default router;
