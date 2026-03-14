import { matchedData } from "express-validator";
import CustomError from "../utils/CustomError.js";
import commentService from "../services/commentService.js";
import successResponse from "../utils/successResponse.js";
import { buildPageMeta } from "../utils/paginationMeta.js";

async function createComment(req, res, next) {
    const postId = Number(req.params?.id);
    if (isNaN(postId)) return next(new CustomError(400, "Invalid post id given"));

    const authorId = Number(req.user?.id);
    if (isNaN(authorId)) return next(new CustomError(401, "Unauthorized"));

    const language = req.language; // set by languageMiddleware
    const { comment: commentBody } = matchedData(req);

    const comment = await commentService.createComment(postId, authorId, commentBody, { language });

    if (!comment) return next(new CustomError(404, "Post not found for this language"));

    return successResponse(res, 201, "Comment created successfully", comment);
}

async function getAllCommentsFromPost(req, res, next) {
    const postId = Number(req.params?.id);
    if (isNaN(postId)) return next(new CustomError(400, "Invalid post id given"));

    const language = req.language;
    const queryParams = matchedData(req);

    const { items, total, page, limit } = await commentService.getAllCommentsFromPost(postId, {
      ...queryParams,
      language,
    });

    const meta = buildPageMeta({ page, limit, total });

    const message = items.length > 0 ? "Comments successfully retrieved" : "No comments found";

    return successResponse(res, 200, message, items, items.length, meta);
}

async function deleteComment(req, res, next) {
    const commentId = Number(req.params?.id);
    if (isNaN(commentId)) return next(new CustomError(400, "Invalid comment id given"));

    const language = req.language;

    const deleted = await commentService.deleteComment(commentId, { language });
    if (!deleted) return next(new CustomError(404, "Comment not found for this language"));

    return successResponse(res, 200, "Comment successfully deleted");
}

async function editComment(req, res, next) {
    const commentId = Number(req.params?.id);
    if (isNaN(commentId)) return next(new CustomError(400, "Invalid comment id given"));

    const language = req.language;
    const { comment: commentBody } = matchedData(req);

    const editedComment = await commentService.updateComment(commentId, commentBody, { language });
    if (!editedComment) return next(new CustomError(404, "Comment not found for this language"));

    return successResponse(res, 200, "Comment successfully updated", editedComment);
}

export default {
  createComment,
  getAllCommentsFromPost,
  deleteComment,
  editComment,
};