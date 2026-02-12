import { matchedData } from "express-validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { hashPassword, matchPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import CustomError from "../utils/CustomError.js";
import authService from "../services/authService.js";
import successResponse from "../utils/successResponse.js";
import createTokenData from "../utils/createTokenData.js";
import REFRESH_TOKEN_COOKIE_SETTINGS from "../utils/refreshTokenCookieSettings.js";
import createTokens from "../utils/createTokens.js";
import CLEAR_COOKIE_SETTINGS from "../utils/clearCookieSettings.js";
import emailService from "../services/emailService.js";
import { toClientUser } from "../utils/toClientUser.js";
import { LEGAL_VERSIONS } from "../constants.js";

async function health(req, res, next) {
  successResponse(res, 200, "Health is ok");
}

async function registerUser(req, res, next) {
  const { username, email, password, acceptedTerms } = matchedData(req);

  if (!acceptedTerms) {
    return next(new CustomError(400, "You must accept the Terms and Rules"));
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await userService.createUser(
    username,
    email,
    hashedPassword,
    {
      termsAcceptedAt: new Date(),
      termsVersion: LEGAL_VERSIONS.TERMS,
    }
  );

  // --- AUTO LOGIN ---
  const { accessToken, refreshToken } = createTokens(newUser);

  const tokenData = createTokenData(req, refreshToken);

  await authService.storeRefreshToken(newUser.id, tokenData);

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_SETTINGS);

  const clientUser = toClientUser(newUser);

  successResponse(res, 201, "User created successfully", {
    accessToken,
    user: clientUser,
    needsEmailVerification: false,
  });

}


async function loginUser(req, res, next) {
  const { userInput, password } = matchedData(req);

  let user;
  if (userInput.includes("@")) {
    user = await userService.getUserByEmail(userInput);
  } else {
    user = await userService.getUserByUsername(userInput);
  }

  if (!user) return next(new CustomError(401, "Invalid credentials"));

  if (!user?.active) return next(new CustomError(403, "User is inactive"));

  const isMatch = await matchPassword(password, user.password);
  if (!isMatch) return next(new CustomError(401, "Invalid credentials"));

  const { accessToken, refreshToken } = createTokens(user);

  const tokenData = createTokenData(req, refreshToken);

  await authService.storeRefreshToken(user.id, tokenData);

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_SETTINGS);

  successResponse(res, 200, "Login successful", accessToken);
}

async function logoutUser(req, res, next) {
  const token = req.cookies?.refreshToken;
  if (token) {
    const decodedUser = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (!decodedUser) return next(new CustomError(400, "Invalid refresh token. Please login"));
    await authService.deleteRefreshToken(decodedUser.id, token);
  }

  res.clearCookie("refreshToken", CLEAR_COOKIE_SETTINGS);

  successResponse(res, 200, "Logged out successfully");
}

async function refreshAccessToken(req, res, next) {
  const token = req.cookies?.refreshToken;
  if (!token) return next(new CustomError(400, "No refresh token. Please login"));

  const decodedUser = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  if (!decodedUser) return next(new CustomError(400, "Invalid refresh token. Please login"));

  const isValid = await authService.getRefreshToken(decodedUser.id, token);
  if (!isValid) return next(new CustomError(400, "Invalid refresh token. Please login"));

  const { accessToken, refreshToken } = createTokens(decodedUser);

  const tokenData = createTokenData(req, refreshToken);

  await authService.storeRefreshToken(decodedUser.id, tokenData);

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_SETTINGS);

  successResponse(res, 200, "New access token provided", accessToken);
}

async function resetPassword(req, res, next) {
  const { email } = matchedData(req);
  const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || "https://bloggy-app.dev";

  const user = await userService.getUserByEmail(email);
  if (!user) return next(new CustomError(404, "User not found"));
  if (!user.active) return next(new CustomError(403, "User is inactive"));

  // raw token sent to user
  const rawToken = crypto.randomBytes(32).toString("hex");

  // hashed token stored
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const issuedAt = new Date();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await authService.storeResetPasswordToken(user.id, {
    token: hashedToken,
    issuedAt,
    expiresAt,
    userAgent: req.headers["user-agent"] || null,
    ipAddress: req.ip,
  });

  const resetUrl = `${FRONTEND_BASE_URL}/reset-password/${rawToken}`;

  await emailService.sendResetPasswordEmail(user.email, resetUrl);

  return successResponse(res, 200, "Reset password email sent", email);
}

async function processResetPassword(req, res, next) {
  const { token } = req.body;
  const { password } = matchedData(req);

  if (!token) return next(new CustomError(400, "Invalid token"));

  const hashedPassword = await hashPassword(password);

  // hash incoming token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const record = await authService.getRecordFromResetPasswordToken(hashedToken);
  if (!record) return next(new CustomError(400, "Invalid or expired token"));

  const user = await userService.getUserById(record.userId);
  if (!user) return next(new CustomError(404, "User not found"));

  if (record.expiresAt < new Date()) return next(new CustomError(400, "Token expired"));

  // update password
  await userService.updateUser(record.userId, { password: hashedPassword });

  // delete token
  authService.deleteResetPasswordToken(record.id);

  return successResponse(res, 200, "Password updated");
}

export default {
  health,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  processResetPassword,
};
