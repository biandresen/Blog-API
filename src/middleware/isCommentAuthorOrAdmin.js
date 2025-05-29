import CustomError from "../utils/CustomError.js";
import { ROLES } from "../constants.js";
import commentService from "../services/commentService.js";

async function isCommentAuthorOrAdmin(req, res, next) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const commentId = Number(req.params?.id); // assuming URL like /comments/:commentId

  if (isNaN(commentId)) return next(new CustomError(400, "Invalid comment id given"));

  const comment = await commentService.getCommentById(commentId);
  if (!comment) return next(new CustomError(404, "Comment not found"));

  if (role === ROLES.ADMIN_ROLE || comment.authorId === userId) {
    return next();
  }

  return next(new CustomError(403, "Not authorized to delete this comment"));
}

export default isCommentAuthorOrAdmin;
