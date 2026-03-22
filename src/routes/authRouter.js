import { Router } from "express";
import registerUserValidator from "../validation/registerValidator.js";
import loginUserValidator from "../validation/loginValidator.js";
import authController from "../controllers/authController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import checkValidation from "../middleware/checkValidation.js";
import resetPasswordValidator from "../validation/resetPasswordValidator.js";
import updatePasswordValidator from "../validation/updatePasswordValidator.js";
import resendVerificationValidator from "../validation/resendVerificationValidator.js";
import { authLimiter, registerLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.get("/health", authController.health);

router.post(
  "/register",
  registerLimiter,
  registerUserValidator,
  checkValidation,
  asyncErrorHandler(authController.registerUser)
);

router.post(
  "/login",
  authLimiter,
  loginUserValidator,
  checkValidation,
  asyncErrorHandler(authController.loginUser)
);

router.post("/logout", authLimiter, asyncErrorHandler(authController.logoutUser));

router.post("/refresh", authLimiter, asyncErrorHandler(authController.refreshAccessToken));

router.get("/verify-email", authLimiter, asyncErrorHandler(authController.verifyEmail));

router.post(
  "/resend-verification",
  authLimiter,
  resendVerificationValidator,
  checkValidation,
  asyncErrorHandler(authController.resendVerificationEmail)
);

router.post(
  "/new-password",
  authLimiter,
  updatePasswordValidator,
  checkValidation,
  asyncErrorHandler(authController.processResetPassword)
);

router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  checkValidation,
  asyncErrorHandler(authController.resetPassword)
);

export default router;