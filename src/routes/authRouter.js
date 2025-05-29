import { Router } from "express";
import registerUserValidator from "../validation/registerValidator.js";
import loginUserValidator from "../validation/loginValidator.js";
import authController from "../controllers/authController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

const router = Router();

router.post("/register", registerUserValidator, asyncErrorHandler(authController.registerUser));
router.post("/login", loginUserValidator, asyncErrorHandler(authController.loginUser));
router.post("/logout", loginUserValidator, asyncErrorHandler(authController.logoutUser));
router.post("/refresh", loginUserValidator, asyncErrorHandler(authController.refreshAccessToken));

export default router;
