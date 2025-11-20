import { matchedData } from "express-validator";
import { hashPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import removePwFromUser from "../utils/removePwFromUser.js";
import CustomError from "../utils/CustomError.js";
import { ROLES } from "../constants.js";
import ensureAllowedFields from "../utils/ensureAllowedFields.js";
import successResponse from "../utils/successResponse.js";
import fs from "fs";
import path from "path";

async function getUserProfile(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const isAdmin = currentUser?.role === ROLES.ADMIN_ROLE;
  const isSelf = currentUser?.id === userId;
  if (!isAdmin && !isSelf) return next(new CustomError(403, "Forbidden. Please login."));

  const requestedUser = await userService.getUserById(userId);

  const userWithoutPassword = removePwFromUser(requestedUser);

  successResponse(res, 200, "User retrieved successfully", userWithoutPassword);
}

async function getUserProfileByNameOrEmail(req, res, next) {
  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const isAdmin = currentUser?.role === ROLES.ADMIN_ROLE;
  if (!isAdmin) return next(new CustomError(403, "Forbidden"));

  const userInput = req.params?.userInput.toLowerCase();

  let requestedUser;
  if (userInput.includes("@")) {
    requestedUser = await userService.getUserByEmail(userInput);
  } else {
    requestedUser = await userService.getUserByUsername(userInput);
  }

  if (!requestedUser) return next(new CustomError(404, "User not found"));

  const userWithoutPassword = removePwFromUser(requestedUser);

  successResponse(res, 200, "User retrieved successfully", userWithoutPassword);
}

async function updateUserProfile(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized"));

  const userUpdateData = matchedData(req);

  // Handle password
  if (userUpdateData.password) {
    userUpdateData.password = await hashPassword(userUpdateData.password);
  } else {
    delete userUpdateData.password;
  }

  let oldAvatarPath = null;

  console.log("Controller req.file:", req.file);

  // Only fetch the user's current avatar if a new avatar is uploaded
  if (req.file) {
    const existingUser = await userService.getUserById(userId);
    oldAvatarPath = existingUser.avatar; // null or "/uploads/avatars/...png"
    console.log("Old path: ", oldAvatarPath);
    userUpdateData.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  const fieldsToUpdate = ensureAllowedFields(userUpdateData, ["username", "email", "password", "avatar"]);

  const updatedUser = await userService.updateUser(userId, fieldsToUpdate);

  // Delete old avatar if new one was uploaded
  if (req.file && oldAvatarPath) {
    try {
      const newAvatarRelative = userUpdateData.avatar; // "/uploads/avatars/..."
      console.log("oldAvatarPath (raw):", JSON.stringify(oldAvatarPath));
      console.log("newAvatarRelative:", JSON.stringify(newAvatarRelative));

      // Safety: don't delete if the old path equals the new path
      if (newAvatarRelative && oldAvatarPath === newAvatarRelative) {
        console.log("Old avatar equals new avatar — skipping delete");
      } else {
        const fullOldPath = path.resolve(process.cwd(), `.${oldAvatarPath}`);
        console.log("Resolved fullOldPath:", fullOldPath);

        // Extra sanity: ensure fullOldPath is inside uploads dir
        const uploadsDir = path.resolve(process.cwd(), "uploads");
        if (!fullOldPath.startsWith(uploadsDir)) {
          console.warn("Refusing to delete outside uploads folder:", fullOldPath);
        } else {
          try {
            await fs.promises.access(fullOldPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
            console.log("File exists and is accessible — deleting:", fullOldPath);
            await fs.promises.unlink(fullOldPath);
            console.log("unlink successful:", fullOldPath);
          } catch (err) {
            if (err.code === "ENOENT") {
              console.log("File not found (already removed):", fullOldPath);
            } else {
              console.error("Could not delete old avatar:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error during old-avatar deletion:", err);
    }
  } else {
    console.log("Skipping deletion — req.file or oldAvatarPath falsy:", !!req.file, !!oldAvatarPath);
  }

  const userWithoutPassword = removePwFromUser(updatedUser);
  successResponse(res, 200, "User updated successfully", userWithoutPassword);
}

async function changeUserRole(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const userUpdateData = matchedData(req);

  const fieldsToUpdate = ensureAllowedFields(userUpdateData, ["role"]);

  const updatedUser = await userService.changeRole(userId, fieldsToUpdate);

  const userWithoutPassword = removePwFromUser(updatedUser);

  successResponse(res, 200, "User role updated successfully", userWithoutPassword);
}

async function deleteUser(req, res, next) {
  const userId = Number(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const deletedUser = await userService.deleteUser(userId);

  const data = { id: userId, username: deletedUser.username, active: false };

  successResponse(res, 200, "User account successfully marked as inactive (soft-delete)", data);
}

async function reactivateUser(req, res, next) {
  const userId = Number(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const reactivatedUser = await userService.reactivateUser(userId);

  const data = { id: userId, username: reactivatedUser.username, active: reactivatedUser.active };

  successResponse(res, 200, "User account successfully reactivated", data);
}

export default {
  getUserProfile,
  getUserProfileByNameOrEmail,
  updateUserProfile,
  changeUserRole,
  reactivateUser,
  deleteUser,
};
