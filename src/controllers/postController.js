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
    message: posts.length > 0 ? "Posts retrieved successfully" : "No posts found for this user",
    data: posts.length > 0 ? posts : [],
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

  const posts = await postService.getAllPostsByAuthor(userId, queryParams);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    count: posts.length,
    message: posts.length > 0 ? "Posts retrieved successfully" : "No posts found for this user",
    data: posts.length > 0 ? posts : [],
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

async function deletePost(req, res, next) {
  const postId = Number(req.params?.id); //postId is checked in previous middleware

  const deletedPost = await postService.deletePost(postId);
  if (!deletedPost) return next(new CustomError(404, `No post found with id ${postId}`));

  res.status(204).send();
  // .json({
  //   status: "success",
  //   statusCode: 204,
  //   message: "Post successfully deleted",
  //   data: null,
  // });
}

async function getAllDraftsForCurrentUser(req, res, next) {
  const userId = Number(req.user?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid user ID"));

  const queryParams = req.query;

  // Normalize tags if present
  if (queryParams.tag) {
    queryParams.tag =
      Array.isArray(queryParams.tag) ?
        queryParams.tag.map((t) => t.trim().toLowerCase())
      : queryParams.tag.split(",").map((t) => t.trim().toLowerCase());
  }

  queryParams.published = false;

  const drafts = await postService.getAllPostsByAuthor(userId, queryParams);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    count: drafts.length,
    message: drafts.length > 0 ? "Drafts retrieved successfully" : "No drafts found for this user",
    data: drafts.length > 0 ? drafts : [],
  });
}

async function getAllDrafts(req, res, next) {
  const queryParams = req.query;

  // Normalize tags if present
  if (queryParams.tag) {
    queryParams.tag =
      Array.isArray(queryParams.tag) ?
        queryParams.tag.map((t) => t.trim().toLowerCase())
      : queryParams.tag.split(",").map((t) => t.trim().toLowerCase());
  }

  const drafts = await postService.getAllDrafts(queryParams);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    count: drafts.length,
    message: drafts.length > 0 ? "Drafts retrieved successfully" : "No drafts found",
    data: drafts.length > 0 ? drafts : [],
  });
}

async function publishDraft(req, res, next) {
  const postId = Number(req.params?.id); //postId is checked in previous middleware

  const publishedDraft = await postService.publishDraft(postId);
  if (!publishedDraft) return next(new CustomError(404, `No post found with id ${postId}`));

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Draft successfully published",
    data: publishedDraft,
  });
}

export default {
  getAllPostsFromUser,
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getAllDraftsForCurrentUser,
  getAllDrafts,
  publishDraft,
};
