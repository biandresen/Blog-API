import { matchedData } from "express-validator";
import CustomError from "../utils/CustomError.js";
import commentService from "../services/commentService.js";
import successResponse from "../utils/successResponse.js";

async function createComment(req, res, next) {
  const postId = Number(req.params?.id);
  if (isNaN(postId)) return next(new CustomError(400, "Invalid post id given"));

  const authorId = Number(req.user?.id);

  const { comment: commentBody } = matchedData(req);

  console.log(postId, authorId);
  const comment = await commentService.createComment(postId, authorId, commentBody);
  successResponse(res, 201, "Comment created successfully", comment);
}

async function getAllCommentsFromPost(req, res, next) {
  const postId = Number(req.params?.id);
  if (isNaN(postId)) return next(new CustomError(400, "Invalid post id given"));

  const queryParams = matchedData(req);

  const comments = await commentService.getAllCommentsFromPost(postId, queryParams);

  const message = comments.length > 0 ? "Comments successfully retrieved" : "No comments found";
  const data = comments.length > 0 ? comments : [];
  const count = comments.length;

  successResponse(res, 200, message, data, count);
}

async function deleteComment(req, res, next) {
  const commentId = Number(req.params?.id); //commentId is checked in previous middleware

  const deletedComment = await commentService.deleteComment(commentId);

  successResponse(res, 200, "Comment successfully deleted");
}

async function editComment(req, res, next) {
  const commentId = Number(req.params?.id); //commentId is checked in previous middleware

  const { comment: commentBody } = matchedData(req);

  const editedComment = await commentService.updateComment(commentId, commentBody);

  successResponse(res, 200, "Comment successfully updated", editedComment);
}

export default {
  createComment,
  getAllCommentsFromPost,
  deleteComment,
  editComment,
};
