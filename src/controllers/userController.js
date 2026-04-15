import { matchedData } from "express-validator";
import { hashPassword } from "../utils/passwordCrypt.js";
import CustomError from "../utils/CustomError.js";
import successResponse from "../utils/successResponse.js";
import userService from "../services/userService.js";
import { toClientUser } from "../utils/toClientUser.js";
import { moderateFields } from "../utils/moderation.js";
import logService from "../services/logService.js";
import { getModerationLogData } from "../utils/moderationLogData.js";

async function getMe(req, res, next) {
  const userId = Number(req.user?.id);
  if (isNaN(userId)) return next(new CustomError(401, "Unauthorized"));

  const language = req.language;
  const user = await userService.getUserById(userId, { language });

  if (!user) return next(new CustomError(404, "User not found"));

  const clientUser = toClientUser(user);

  return successResponse(res, 200, "User retrieved successfully", clientUser, 1);
}

async function getUserByNameOrEmail(req, res, next) {
  const userInput = req.params?.userInput?.trim();

  if (!userInput) {
    return next(new CustomError(400, "Username or email is required"));
  }

  const looksLikeEmail = userInput.includes("@");
  let user = null;

  if (looksLikeEmail) {
    user = await userService.getUserByEmail(userInput);
    if (!user) user = await userService.getUserByUsername(userInput);
  } else {
    user = await userService.getUserByUsername(userInput);
    if (!user) user = await userService.getUserByEmail(userInput);
  }

  if (!user) {
    return next(new CustomError(404, "User not found"));
  }

  return successResponse(
    res,
    200,
    "User retrieved successfully",
    { ...toClientUser(user), active: user.active },
    1,
  );
}

async function updateUserProfile(req, res, next) {
  const userId = Number(req.user?.id);
  if (isNaN(userId)) return next(new CustomError(401, "Unauthorized"));

  const updateData = matchedData(req);

  if (updateData.username) {
    const moderation = moderateFields({
      username: updateData.username.trim(),
    });

    if (moderation.blocked) {
      const { matchedTerms, matchedVariants } = getModerationLogData(moderation);

      await logService.createModerationEvent({
        userId: Number(req.user?.id) || null,
        action: "create_post",
        blocked: true,
        fieldNames: ["title", "body", "tags"],
        matchedTerms,
        matchedVariants,
        contentPreview: [title, body].filter(Boolean).join(" | ").slice(0, 160),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null,
      });

      return next(
        new CustomError(400, "Content contains blocked language", [
          { field: "content", message: "Contains inappropriate language" },
        ]),
      );
    }

    updateData.username = updateData.username.trim();
  }

  if (updateData.email) {
    updateData.email = updateData.email.trim().toLowerCase();
  }

  if (req.processedImage?.relativeUrl) {
    updateData.avatar = req.processedImage.relativeUrl;
  }

  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  const updated = await userService.updateUser(userId, updateData);

  return successResponse(res, 200, "User updated successfully", toClientUser(updated), 1);
}

async function deleteUser(req, res, next) {
  const userId = Number(req.params?.id);

  if (isNaN(userId)) {
    return next(new CustomError(400, "Invalid user id given"));
  }

  const targetUser = await userService.getUserById(userId);

  if (!targetUser) {
    return next(new CustomError(404, "User not found"));
  }

  const deletedUser = await userService.deleteUser(userId);

  await logService.createAuditLog({
    actorUserId: req.user?.id ?? null,
    targetUserId: targetUser.id,
    action: "USER_DEACTIVATED",
    entityType: "User",
    entityId: String(targetUser.id),
    summary: `User ${targetUser.username} was deactivated`,
    diff: {
      before: {
        active: true,
        deletedAt: targetUser.deletedAt,
      },
      after: {
        active: false,
        deletedAt: deletedUser.deletedAt?.toISOString?.() ?? deletedUser.deletedAt,
      },
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || null,
  });

  return successResponse(
    res,
    200,
    "User deactivated successfully",
    {
      ...toClientUser(deletedUser),
      active: deletedUser.active,
      deletedAt: deletedUser.deletedAt,
    },
    1,
  );
}

async function reactivateUser(req, res, next) {
  const userId = Number(req.params?.id);

  if (isNaN(userId)) {
    return next(new CustomError(400, "Invalid user id given"));
  }

  const targetUser =
    (await userService.getUserByIdEvenIfInactive) ?
      await userService.getUserByIdEvenIfInactive(userId)
    : await userService.getUserByEmail("__placeholder__"); // replace by proper service method if needed

  const updatedUser = await userService.reactivateUser(userId);

  if (!updatedUser) {
    return next(new CustomError(404, "User not found"));
  }

  await logService.createAuditLog({
    actorUserId: req.user?.id ?? null,
    targetUserId: updatedUser.id,
    action: "USER_REACTIVATED",
    entityType: "User",
    entityId: String(updatedUser.id),
    summary: `User ${updatedUser.username} was reactivated`,
    diff: {
      before: { active: false },
      after: { active: true },
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || null,
  });

  return successResponse(
    res,
    200,
    "User reactivated successfully",
    {
      ...toClientUser(updatedUser),
      active: updatedUser.active,
      deletedAt: updatedUser.deletedAt,
    },
    1,
  );
}

export default {
  getMe,
  getUserByNameOrEmail,
  updateUserProfile,
  deleteUser,
  reactivateUser,
};
