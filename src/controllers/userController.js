import userService from "../services/userService.js";
import removePwFromUser from "../utils/removePwFromUser.js";
import CustomError from "../utils/CustomError.js";

async function getUserProfile(req, res, next) {
  const userId = parseInt(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const currentUser = req.user;
  if (!currentUser) return next(new CustomError(401, "Unauthorized. Please login."));

  const isAdmin = currentUser?.role === "ADMIN";
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

export default {
  getUserProfile,
};
