import { matchedData } from "express-validator";
import CustomError from "../utils/CustomError.js";
import commentService from "../services/commentService.js";
import postService from "../services/postService.js";

async function createComment(req, res, next) {
  const postId = Number(req.params?.id);
  if (isNaN(postId)) return next(new CustomError(400, "Invalid post id given"));

  const post = await postService.getPostById(postId);
  if (!post) return next(new CustomError(404, "Post not found"));

  const authorId = req.user?.id;

  const { comment: commentText } = matchedData(req);

  const comment = await commentService.createComment(postId, authorId, commentText);

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "Comment created successfully",
    data: comment,
  });
}

async function getAllCommentsFromPost(req, res, next) {
  const postId = Number(req.params?.id);
  if (isNaN(postId)) return next(new CustomError(400, "Invalid post id given"));

  const comments = await commentService.getAllCommentsFromPost(postId);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: comments.length > 0 ? "Comments successfully retrieved" : "No comments found",
    count: comments.length,
    data: comments.length > 0 ? comments : [],
  });
}

async function deleteComment(req, res, next) {
  const commentId = Number(req.params?.id); //commentId is checked in previous middleware

  const deletedComment = await commentService.deleteComment(commentId);
  if (!deletedComment) return next(new CustomError(404, `No post found with id ${commentId}`));

  res.status(204).send();
  // .json({
  //   status: "success",
  //   statusCode: 204,
  //   message: "Post successfully deleted",
  //   data: null,
  // });
}

export default {
  createComment,
  getAllCommentsFromPost,
  deleteComment,
};
