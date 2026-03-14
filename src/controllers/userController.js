import { matchedData } from "express-validator";
import { hashPassword } from "../utils/passwordCrypt.js";
import CustomError from "../utils/CustomError.js";
import successResponse from "../utils/successResponse.js";
import userService from "../services/userService.js";
import { toClientUser } from "../utils/toClientUser.js";

async function getMe(req, res, next) {
  const userId = Number(req.user?.id);
  if (isNaN(userId)) return next(new CustomError(401, "Unauthorized"));

  const language = req.language; // used to filter currentBadges
  const user = await userService.getUserById(userId, { language });

  if (!user) return next(new CustomError(404, "User not found"));

  const clientUser = toClientUser(user);
  console.log("AUTH: ", clientUser)


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

    if (!user) {
      user = await userService.getUserByUsername(userInput);
    }
  } else {
    user = await userService.getUserByUsername(userInput);

    if (!user) {
      user = await userService.getUserByEmail(userInput);
    }
  }

  if (!user) {
    return next(new CustomError(404, "User not found"));
  }

  return successResponse(res,200,"User retrieved successfully",{...toClientUser(user),active: user.active,},1);
}

async function updateUserProfile(req, res, next) {
  const userId = Number(req.user?.id);
  if (isNaN(userId)) return next(new CustomError(401, "Unauthorized"));

  const updateData = matchedData(req);

  // Handle avatar upload
  if (req.processedImage?.relativeUrl) {
    updateData.avatar = req.processedImage.relativeUrl;
  }

  // Hash password if it is being updated
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  const updated = await userService.updateUser(userId, updateData);

  return successResponse(
    res,
    200,
    "User updated successfully",
    toClientUser(updated),
    1
  );
}

async function deleteUser(req, res, next) {
  const userId = Number(req.params?.id);

//   if (Number(req.user?.id) === userId) {
//   return next(new CustomError(400, "You cannot delete your own account"));
// }

  if (isNaN(userId)) {
    return next(new CustomError(400, "Invalid user id given"));
  }

  const user = await userService.getUserById(userId);

  if (!user) {
    return next(new CustomError(404, "User not found"));
  }

  const deletedUser = await userService.deleteUser(userId);

  return successResponse(
    res,
    200,
    "User deleted successfully",
    {
      ...toClientUser(deletedUser),
      active: deletedUser.active,
      deletedAt: deletedUser.deletedAt,
    },
    1
  );
}

async function reactivateUser(req, res, next) {
  const userId = Number(req.params?.id);

  if (isNaN(userId)) {
    return next(new CustomError(400, "Invalid user id given"));
  }

  const updatedUser = await userService.reactivateUser(userId);

   if (!updatedUser) {
    return next(new CustomError(404, "User not found"));
  }

  return successResponse(
    res,
    200,
    "User reactivated successfully",
    {
      ...toClientUser(updatedUser),
      active: updatedUser.active,
      deletedAt: updatedUser.deletedAt,
    },
    1
  );
}

export default {
  getMe,
  getUserByNameOrEmail,
  updateUserProfile,
  deleteUser,
  reactivateUser,
};