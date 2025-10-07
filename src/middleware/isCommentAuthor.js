import CustomError from "../utils/CustomError.js";
import commentService from "../services/commentService.js";

async function isCommentAuthor(req, res, next) {
  const userId = req.user?.id;
  const commentId = Number(req.params?.id);

  if (isNaN(commentId)) return next(new CustomError(400, "Invalid comment id given"));

  const comment = await commentService.getCommentById(commentId);
  if (!comment) return next(new CustomError(404, `No comment found with id ${commentId}`));

  if (comment.authorId === userId) {
    return next();
  }

  return next(new CustomError(403, "Forbidden: Only comment author are allowed to perform this action"));
}

export default isCommentAuthor;
