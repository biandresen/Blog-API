import CustomError from "../utils/CustomError.js";
import { ROLES } from "../constants.js";
import commentService from "../services/commentService.js";

async function isCommentAuthorOrAdmin(req, res, next) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const commentId = Number(req.params?.id); // assuming URL like /comments/:commentId

  if (isNaN(commentId)) return next(new CustomError(400, "Invalid comment id given"));

  const comment = await commentService.getCommentById(commentId);
  if (!comment) return next(new CustomError(404, `No comment found with id ${commentId}`));

  if (role === ROLES.ADMIN_ROLE || comment.authorId === userId) {
    return next();
  }

  return next(
    new CustomError(403, "Forbidden: Only admins or comment author are allowed to perform this action")
  );
}

export default isCommentAuthorOrAdmin;
