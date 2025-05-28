import { matchedData, validationResult } from "express-validator";
import postService from "../services/postService.js";
import CustomError from "../utils/CustomError.js";

async function getAllPosts(req, res, next) {
  const queryParams = req.query;

  // Normalize tags if present
  if (queryParams.tag) {
    queryParams.tag =
      Array.isArray(queryParams.tag) ?
        queryParams.tag.map((t) => t.trim().toLowerCase())
      : queryParams.tag.split(",").map((t) => t.trim().toLowerCase());
  }

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

  // Normalize tags if present
  if (queryParams.tag) {
    queryParams.tag =
      Array.isArray(queryParams.tag) ?
        queryParams.tag.map((t) => t.trim().toLowerCase())
      : queryParams.tag.split(",").map((t) => t.trim().toLowerCase());
  }

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

async function createPost(req, res, next) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(new CustomError(400, "Validation failed", validationErrors.array()));
  }

  const { title, body, published, tags } = matchedData(req);
  const authorId = req.user?.id; //authorId is checked in previous middleware

  const normalizedTags = tags.map((tag) => tag.toLowerCase());

  const createdPost = await postService.createPost(authorId, title, body, published, normalizedTags);

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: published === true ? "Post was successfully published" : "Post was successfully drafted",
    data: createdPost,
  });
}

async function updatePost(req, res, next) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(new CustomError(400, "Validation failed", validationErrors.array()));
  }

  const postId = Number(req.params?.id); //postId is checked in previous middleware

  const { title, body, published, tags } = matchedData(req);

  const normalizedTags = tags ? tags.map((tag) => tag.toLowerCase()) : undefined;

  const updatedPost = await postService.updatePost(postId, {
    title,
    body,
    published,
    tags: normalizedTags,
  });

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Post was successfully updated",
    data: updatedPost,
  });
}

export default {
  getAllPostsFromUser,
  getAllPosts,
  getPost,
  createPost,
  updatePost,
};
