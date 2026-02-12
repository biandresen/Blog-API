import { matchedData } from "express-validator";
import { hashPassword } from "../utils/passwordCrypt.js";
import userService from "../services/userService.js";
import CustomError from "../utils/CustomError.js";
import { ROLES } from "../constants.js";
import ensureAllowedFields from "../utils/ensureAllowedFields.js";
import successResponse from "../utils/successResponse.js";
import fs from "fs";
import path from "path";
import { UPLOADS_DIR } from "../config/paths.js";
import { toClientUser } from "../utils/toClientUser.js";


async function getMe(req, res, next) {
  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please log in."));

  const userId = parseInt(currentUser.id);
  if (isNaN(userId)) return next(new CustomError(401, "Invalid token payload."));

  const user = await userService.getUserById(userId);
  if (!user) return next(new CustomError(404, "User not found"));

  const clientUser = toClientUser(user);
  return successResponse(res, 200, "User retrieved successfully", clientUser);
}

async function getUserProfile(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const isAdmin = currentUser?.role === ROLES.ADMIN_ROLE;
  const isSelf = currentUser?.id === userId;
  if (!isAdmin && !isSelf) return next(new CustomError(403, "Forbidden. Please login."));

  const requestedUser = await userService.getUserById(userId);

  const clientUser = toClientUser(requestedUser);

  successResponse(res, 200, "User retrieved successfully", clientUser);
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

  const clientUser = toClientUser(requestedUser);

  successResponse(res, 200, "User retrieved successfully", clientUser);
}

// Resolve a public URL like "/uploads/avatars/abc.webp" -> absolute filesystem path.
// Returns null if URL is not a local uploads URL (safety).
function resolveUploadsFilePath(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;

  // Only allow deleting files that live under your public uploads URL
  if (!avatarUrl.startsWith("/uploads/")) return null;

  // Convert URL path -> filesystem path.
  // Public URL "/uploads/..." maps to filesystem "<UPLOADS_DIR>/..."
  const relativeInsideUploads = avatarUrl.replace(/^\/uploads\/?/, ""); // "avatars/abc.webp"
  const fullPath = path.resolve(UPLOADS_DIR, relativeInsideUploads);

  // Ensure the resolved path stays inside UPLOADS_DIR (prevents traversal deletes)
  if (!fullPath.startsWith(UPLOADS_DIR + path.sep)) return null;

  return fullPath;
}

async function updateUserProfile(req, res, next) {
    const userId = Number.parseInt(req.params?.id, 10);
    if (Number.isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

    const currentUser = req.user;
    if (!currentUser) return next(new CustomError(401, "Unauthorized"));

    // Only validated/sanitized fields
    const userUpdateData = matchedData(req);

    // Handle password
    if (userUpdateData.password) {
      userUpdateData.password = await hashPassword(userUpdateData.password);
    } else {
      delete userUpdateData.password;
    }

    let oldAvatarUrl = null;

    /**
     * The new upload pipeline (multer memory + sharp processing) sets:
     * req.processedImage = { filename, relativeUrl, bytes, mime }
     *
     * If no file was uploaded, req.processedImage is undefined.
     */
    if (req.processedImage) {
      const existingUser = await userService.getUserById(userId);
      oldAvatarUrl = existingUser.avatar; // e.g. "/uploads/avatars/old.webp" or null

      // Store the URL we will serve publicly (always webp with your pipeline)
      userUpdateData.avatar = req.processedImage.relativeUrl; // e.g. "/uploads/avatars/<new>.webp"
    }

    const fieldsToUpdate = ensureAllowedFields(userUpdateData, [
      "username",
      "email",
      "password",
      "avatar",
    ]);

    const updatedUser = await userService.updateUser(userId, fieldsToUpdate);
    // Delete old avatar if a new one was uploaded and there was an old one
    if (req.processedImage && oldAvatarUrl) {
      const newAvatarUrl = userUpdateData.avatar;

      // Safety: don't delete if unchanged
      if (newAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
        const fullOldPath = resolveUploadsFilePath(oldAvatarUrl);
        if (fullOldPath) {
          try {
            await fs.promises.unlink(fullOldPath);
          } catch (err) {
            if (err.code !== "ENOENT") {
              console.error("Could not delete old avatar:", err);
            }
          }
        } else {
          // If it wasn't a local uploads file, do not attempt deletion
          console.warn("Refusing to delete non-local avatar URL:", oldAvatarUrl);
        }
      }
    }
    const clientUser = toClientUser(updatedUser);
    return successResponse(res, 200, "User updated successfully", clientUser);
}

async function changeUserRole(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const userUpdateData = matchedData(req);

  const fieldsToUpdate = ensureAllowedFields(userUpdateData, ["role"]);

  const updatedUser = await userService.changeRole(userId, fieldsToUpdate);

  const clientUser = toClientUser(updatedUser);

  successResponse(res, 200, "User role updated successfully", clientUser);
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
  getMe,
  changeUserRole,
  reactivateUser,
  deleteUser,
};
