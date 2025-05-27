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

async function getPost(req, res, next) {
  const postId = Number(req.params?.id);
  if (isNaN(postId)) return next(new CustomError(400, "Invalid id given"));

  const post = await postService.getPostById(postId);
  if (!post) return next(new CustomError(404, `No post found with id ${postId}`));

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Post retrieved successfully",
    data: post,
  });
}

export default {
  getAllPostsFromUser,
  getAllPosts,
  getPost,
};
