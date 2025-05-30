import { matchedData } from "express-validator";
import jwt from "jsonwebtoken";

import { hashPassword, matchPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import CustomError from "../utils/CustomError.js";
import authService from "../services/authService.js";
import removePwFromUser from "../utils/removePwFromUser.js";
import successResponse from "../utils/successResponse.js";
import createTokenData from "../utils/createTokenData.js";
import REFRESH_TOKEN_COOKIE_SETTINGS from "../utils/refreshTokenCookieSettings.js";
import createTokens from "../utils/createTokens.js";
import CLEAR_COOKIE_SETTINGS from "../utils/clearCookieSettings.js";

async function registerUser(req, res, next) {
  const { username, email, password } = matchedData(req);

  const hashedPassword = await hashPassword(password);

  const newUser = await userService.createUser(username, email, hashedPassword);

  const userWithoutPassword = removePwFromUser(newUser);

  successResponse(res, 201, "User created successfully", userWithoutPassword);
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

export default {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
};
