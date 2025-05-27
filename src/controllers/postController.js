import postService from "../services/postService.js";
import CustomError from "../utils/CustomError.js";

async function getAllPosts(req, res, next) {
  const queryParams = req.query;
  const posts = await postService.getAllPosts(queryParams);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    count: posts.length,
    message: posts.length === 0 ? "No posts found for this user" : "Posts retrieved successfully",
    data: posts,
  });
}

async function getAllPostsFromUser(req, res, next) {
  const userId = Number(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const queryParams = req.query;

  const posts = await postService.getAllPostsByUser(userId, queryParams);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    count: posts.length,
    message: posts.length === 0 ? "No posts found for this user" : "Posts retrieved successfully",
    data: posts,
  });
}

export default {
  getAllPostsFromUser,
  getAllPosts,
};
