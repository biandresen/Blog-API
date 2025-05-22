import { validationResult, matchedData } from "express-validator";
import jwt from "jsonwebtoken";

import { hashPassword, matchPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import CustomError from "../utils/CustomError.js";
import authService from "../services/authService.js";

async function registerUser(req, res, next) {
  console.log("Controller");
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(new CustomError(400, "Validation failed", validationErrors.array()));
  }

  const data = matchedData(req);
  if (!data.username || !data.email || !data.password) {
    return next(new CustomError(400, "Required fields are missing"));
  }
  const { username, email, password } = data;

  const hashedPassword = await hashPassword(password);

  const newUser = await userService.createUser(username, email, hashedPassword);

  // Remove password from response
  const { password: _pw, ...userWithoutPassword } = newUser;

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "User created successfully",
    data: {
      user: userWithoutPassword,
    },
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

  const isMatch = await matchPassword(password, user.password);
  if (!isMatch) return next(new CustomError(401, "Invalid credentials"));

  const tokenPayload = { id: user.id, username: user.username, email: user.email };
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

  const tokenData = {
    token: refreshToken,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.get("User-Agent") || null,
    ipAddress: req.ip || null,
  };

  await authService.storeRefreshToken(user.id, tokenData);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Login successful",
    accessToken,
  });
}

export default {
  registerUser,
  loginUser,
};
