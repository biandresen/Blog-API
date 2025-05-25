import postService from "../services/postService.js";
import CustomError from "../utils/CustomError.js";

async function getAllPostsFromUser(req, res, next) {
  const userId = Number(req?.params?.id);
  const queryParams = req?.query;
  console.log(req.query);

  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const posts = await postService.getAllPostsByUser(userId, queryParams);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: posts.length === 0 ? "No posts found for this user" : "posts retrieved successfully",
    data: posts,
  });
}

export default {
  getAllPostsFromUser,
};
