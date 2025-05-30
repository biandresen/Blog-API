import { Router } from "express";
import registerUserValidator from "../validation/registerValidator.js";
import loginUserValidator from "../validation/loginValidator.js";
import authController from "../controllers/authController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import checkValidation from "../middleware/checkValidation.js";

const router = Router();

router.post(
  "/register",
  registerUserValidator,
  checkValidation,
  asyncErrorHandler(authController.registerUser)
);
router.post("/login", loginUserValidator, checkValidation, asyncErrorHandler(authController.loginUser));
router.post("/logout", asyncErrorHandler(authController.logoutUser));
router.post("/refresh", asyncErrorHandler(authController.refreshAccessToken));

export default router;
