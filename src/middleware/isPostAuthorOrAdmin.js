import CustomError from "../utils/CustomError.js";
import { ROLES } from "../constants.js";
import postService from "../services/postService.js";

async function isAuthorOrAdmin(req, res, next) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const postId = Number(req.params?.id);

  if (isNaN(postId)) return next(new CustomError(400, "Invalid post id given"));

  const post = await postService.getPostById(postId);
  if (!post) return next(new CustomError(404, `No post found with id ${postId}`));

  if (role === ROLES.ADMIN_ROLE || post.authorId === userId) {
    return next();
  }
  return next(
    new CustomError(403, "Forbidden: Only admins or post author are allowed to perform this action")
  );
}

export default isAuthorOrAdmin;
