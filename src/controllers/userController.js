import { matchedData, validationResult } from "express-validator";
import { hashPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import removePwFromUser from "../utils/removePwFromUser.js";
import CustomError from "../utils/CustomError.js";
import { ROLES } from "../constants.js";
import ensureAllowedFields from "../utils/ensureAllowedFields.js";

async function getUserProfile(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const isAdmin = currentUser?.role === ROLES.ADMIN_ROLE;
  const isSelf = currentUser?.id === userId;
  if (!isAdmin && !isSelf) return next(new CustomError(403, "Forbidden. Please login."));

  const requestedUser = await userService.getUserById(userId);
  if (!requestedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const userWithoutPassword = removePwFromUser(requestedUser);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "User retrieved successfully",
    data: userWithoutPassword,
  });
}

async function updateUserProfile(req, res, next) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(new CustomError(400, "Validation failed", validationErrors.array()));
  }

  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const isAdmin = currentUser?.role === ROLES.ADMIN_ROLE;
  const isSelf = currentUser?.id === userId;
  if (!isAdmin && !isSelf) return next(new CustomError(403, "Forbidden. Please login."));

  const userUpdateData = matchedData(req);

  if (userUpdateData.password) {
    userUpdateData.password = await hashPassword(userUpdateData.password);
  } else {
    // remove password to prevent accidental overwrite with undefined/null
    delete userUpdateData.password;
  }

  const fieldsToUpdate = ensureAllowedFields(userUpdateData, [("username", "email", "password", "avatar")]);

  const updatedUser = await userService.updateUser(userId, fieldsToUpdate);
  if (!updatedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const userWithoutPassword = removePwFromUser(updatedUser);

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "User updated successfully",
    data: userWithoutPassword,
  });
}

async function changeUserRole(req, res, next) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(new CustomError(400, "Validation failed", validationErrors.array()));
  }

  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const userUpdateData = matchedData(req);

  const fieldsToUpdate = ensureAllowedFields(userUpdateData, ["role"]);

  const updatedUser = await userService.changeRole(userId, fieldsToUpdate);
  if (!updatedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const userWithoutPassword = removePwFromUser(updatedUser);

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "User role updated successfully",
    data: userWithoutPassword,
  });
}

export default {
  getUserProfile,
  updateUserProfile,
  changeUserRole,
};
