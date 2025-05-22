import { validationResult, matchedData } from "express-validator";
import { hashPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import CustomError from "../utils/CustomError.js";

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

export default {
  registerUser,
};
