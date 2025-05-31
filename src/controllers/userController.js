import { matchedData } from "express-validator";
import { hashPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import removePwFromUser from "../utils/removePwFromUser.js";
import CustomError from "../utils/CustomError.js";
import { ROLES } from "../constants.js";
import ensureAllowedFields from "../utils/ensureAllowedFields.js";
import successResponse from "../utils/successResponse.js";

async function getUserProfile(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const isAdmin = currentUser?.role === ROLES.ADMIN_ROLE;
  const isSelf = currentUser?.id === userId;
  if (!isAdmin && !isSelf) return next(new CustomError(403, "Forbidden. Please login."));

  const requestedUser = await userService.getUserById(userId);
  // if (!requestedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const userWithoutPassword = removePwFromUser(requestedUser);

  successResponse(res, 200, "User retrieved successfully", userWithoutPassword);
}

async function updateUserProfile(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const userUpdateData = matchedData(req);

  if (userUpdateData.password) {
    userUpdateData.password = await hashPassword(userUpdateData.password);
  } else {
    // remove password to prevent accidental overwrite with undefined/null
    delete userUpdateData.password;
  }

  const fieldsToUpdate = ensureAllowedFields(userUpdateData, [("username", "email", "password", "avatar")]);

  const updatedUser = await userService.updateUser(userId, fieldsToUpdate);
  // if (!updatedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const userWithoutPassword = removePwFromUser(updatedUser);

  successResponse(res, 200, "User updated successfully", userWithoutPassword);
}

async function changeUserRole(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const userUpdateData = matchedData(req);

  const fieldsToUpdate = ensureAllowedFields(userUpdateData, ["role"]);

  const updatedUser = await userService.changeRole(userId, fieldsToUpdate);
  // if (!updatedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const userWithoutPassword = removePwFromUser(updatedUser);

  successResponse(res, 200, "User role updated successfully", userWithoutPassword);
}

async function deleteUser(req, res, next) {
  const userId = Number(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const deletedUser = await userService.deleteUser(userId);
  // if (!deletedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const data = { id: userId, active: false };

  successResponse(res, 200, "User account successfully marked as inactive (soft-delete)", data);
}

async function reactivateUser(req, res, next) {
  const userId = Number(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const reactivatedUser = await userService.reactivateUser(userId);
  // if (!reactivatedUser) return next(new CustomError(404, `No user found with id ${userId}`));

  const data = { id: userId, active: reactivatedUser.active };

  successResponse(res, 200, "User account successfully reactivated", data);
}

export default {
  getUserProfile,
  updateUserProfile,
  changeUserRole,
  reactivateUser,
  deleteUser,
};
