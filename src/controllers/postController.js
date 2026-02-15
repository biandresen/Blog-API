import { matchedData } from "express-validator";
import postService from "../services/postService.js";
import userService from "../services/userService.js";
import CustomError from "../utils/CustomError.js";
import normalizeTags from "../utils/normalizeTags.js";
import successResponse from "../utils/successResponse.js";
import { toClientUser } from "../utils/toClientUser.js";
import { isSameUtcDay, isYesterdayUtc } from "../utils/date.js";

async function getAllPosts(req, res, next) {
  const queryParams = matchedData(req);

  queryParams.tag = queryParams.tag ? normalizeTags(queryParams.tag) : undefined;

  const posts = await postService.getAllPosts(queryParams);

  const message = posts.length > 0 ? "Post(s) retrieved successfully" : "No posts found";
  const data = posts.length > 0 ? posts : [];
  const count = posts.length;

  successResponse(res, 200, message, data, count);
}

async function getPopularPosts(req, res, next) {
  const posts = await postService.getPopularPosts();

  const message = posts.length > 0 ? "Post(s) retrieved successfully" : "No posts found";
  const data = posts.length > 0 ? posts : [];
  const count = posts.length;

  successResponse(res, 200, message, data, count);
}

async function getRandomPost(req, res) {
  const post = await postService.getRandomPost();
  const message = post ? "Post retrieved successfully" : "No post found";
  const count = post ? 1 : 0

  return successResponse(res, 200, message, post, count);
}

async function getDailyPost(req, res) {
  const post = await postService.getDailyPost();
  const message = post ? "Post retrieved successfully" : "No post found";
  const count = post ? 1 : 0

  return successResponse(res, 200, message, post, count);
}

async function getAllPostsFromUser(req, res, next) {
  const userId = Number(req.params?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid id given"));

  const queryParams = matchedData(req);

  queryParams.tag = queryParams.tag ? normalizeTags(queryParams.tag) : undefined;

  const posts = await postService.getAllPostsByAuthor(userId, queryParams); //Only getting published posts by default

  const message = posts.length > 0 ? "Post(s) retrieved successfully" : "No posts found for this user";
  const data = posts.length > 0 ? posts : [];
  const count = posts.length;

  successResponse(res, 200, message, data, count);
}

async function getPost(req, res, next) {
  const postId = Number(req.params?.id);
  if (isNaN(postId)) return next(new CustomError(400, "Invalid id given"));

  const post = await postService.getPostById(postId);

  if (!post) successResponse(res, 404, "No post found", post);

  successResponse(res, 200, "Post retrieved successfully", post);
}

async function createPost(req, res, next) {
  const { title, body, published, tags } = matchedData(req);
  const authorId = Number(req.user?.id); //authorId is checked in previous middleware

  const normalizedTags = tags ? normalizeTags(tags) : undefined;

  const createdPost = await postService.createPost(authorId, title, body, published, normalizedTags);

  const message = published === true ? "Post was successfully published" : "Post was successfully drafted";

  successResponse(res, 200, message, createdPost);
}

async function updatePost(req, res, next) {
  const postId = Number(req.params?.id); //postId is checked in previous middleware
  const { title, body, published, tags } = matchedData(req);

  const normalizedTags = tags ? normalizeTags(tags) : undefined;

  const updatedPost = await postService.updatePost(postId, {
    title,
    body,
    published,
    tags: normalizedTags,
  });

  successResponse(res, 200, "Post was successfully updated", updatedPost);
}

async function deletePost(req, res, next) {
  const postId = Number(req.params?.id); //postId is checked in previous middleware

  const deletedPost = await postService.deletePost(postId);

  successResponse(res, 200, "Post successfully deleted");
}

async function getAllDraftsFromCurrentUser(req, res, next) {
  const userId = Number(req.user?.id);
  if (isNaN(userId)) return next(new CustomError(400, "Invalid user ID"));

  const queryParams = matchedData(req);

  queryParams.tag = queryParams.tag ? normalizeTags(queryParams.tag) : undefined;

  queryParams.published = false;

  const drafts = await postService.getAllPostsByAuthor(userId, queryParams);

  const message = drafts.length > 0 ? "Drafts retrieved successfully" : "No drafts found for this user";
  const data = drafts.length > 0 ? drafts : [];
  const count = drafts.length;

  successResponse(res, 200, message, data, count);
}

async function getAllDrafts(req, res, next) {
  const queryParams = matchedData(req);

  queryParams.tag = queryParams.tag ? normalizeTags(queryParams.tag) : undefined;

  const drafts = await postService.getAllDrafts(queryParams);

  const message = drafts.length > 0 ? "Drafts retrieved successfully" : "No drafts found";
  const data = drafts.length > 0 ? drafts : [];
  const count = drafts.length;

  successResponse(res, 200, message, data, count);
}

async function publishDraft(req, res, next) {
  const postId = Number(req.params?.id); //postId is checked in previous middleware

  const publishedDraft = await postService.publishDraft(postId);

  successResponse(res, 200, "Draft successfully published", publishedDraft);
}

async function searchPosts(req, res, next) {
  const { searchParameters, page, limit, sort } = matchedData(req);

  if (!searchParameters || typeof searchParameters !== "string" || !searchParameters.trim()) {
    return successResponse(res, 400, "No search parameters were given", []); //Not success, but same structure.
  }

  const arrayOfSearchParams = searchParameters
    .split(/[\s,]+/) // split on spaces or commas
    .filter(Boolean); // remove empty strings

  if (!Array.isArray(arrayOfSearchParams) || arrayOfSearchParams.length === 0) {
    return next(new CustomError(400, "Invalid entry of search parameters"));
  }

  const posts = await postService.searchPosts(arrayOfSearchParams, { page, limit, sort });

  const message = posts.length > 0 ? "Posts retrieved successfully" : "No posts were found";
  const data = posts.length > 0 ? posts : [];
  const count = posts.length;

  successResponse(res, 200, message, data, count);
}

async function toggleLike(req, res, next) {
  const userId = req.user?.id;
  if (isNaN(userId)) return next(new CustomError(400, "Invalid user ID"));

  const postId = Number(req.params?.id);
  if (isNaN(postId)) return next(new CustomError(400, "Invalid id given"));

  const post = await postService.getPostById(postId);
  if (!post) return next(new CustomError(404, `No post with id ${postId} found`));

  const existing = await postService.hasLiked(postId, userId);

  if (existing) {
    await postService.removeLike(postId, userId);
    return successResponse(res, 200, "Unliked post");
  } else {
    await postService.addLike(postId, userId);
    return successResponse(res, 201, "Liked post");
  }
}

async function recordDailyJokeView(req, res, next) {
  const currentUser = req.user;
  if (!currentUser?.id) return next(new CustomError(401, "Unauthorized. Please log in."));

  const userId = Number(currentUser.id);
  const user = await userService.getUserById(userId);
  if (!user) return next(new CustomError(404, "User not found"));
  if (!user.active) return next(new CustomError(403, "User is inactive"));

  const now = new Date();
  const last = user.dailyJokeLastViewedAt;

  let newStreak = user.dailyJokeStreak ?? 0;

  if (!last) {
    newStreak = 1;
  } else if (isSameUtcDay(last, now)) {
    // already viewed today => do nothing
    newStreak = user.dailyJokeStreak ?? 0;
  } else if (isYesterdayUtc(last, now)) {
    newStreak = (user.dailyJokeStreak ?? 0) + 1;
  } else {
    newStreak = 1;
  }

  const best = Math.max(user.dailyJokeBestStreak ?? 0, newStreak);

  const updated = await userService.updateUser(userId, {
    dailyJokeStreak: newStreak,
    dailyJokeBestStreak: best,
    dailyJokeLastViewedAt: now,
  });

  const clientUser = toClientUser(updated);

  return successResponse(res, 200, "Daily joke view recorded", {
    dailyJokeStreak: clientUser.dailyJokeStreak,
    dailyJokeBestStreak: clientUser.dailyJokeBestStreak,
    dailyJokeLastViewedAt: clientUser.dailyJokeLastViewedAt,
    user: clientUser, // optional; convenient for frontend state refresh
  });
}




export default {
  getAllPostsFromUser,
  getAllPosts,
  getPopularPosts,
  getRandomPost,
  getDailyPost,
  recordDailyJokeView,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getAllDraftsFromCurrentUser,
  getAllDrafts,
  publishDraft,
  searchPosts,
  toggleLike,
};
