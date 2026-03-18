import prisma from "../config/prismaClient.js";
import { INCLUDED_IN_USER } from "../constants.js";
import { normalizeLanguage } from "../utils/language.js";

/**
 * Ensures the target post exists in the requested language.
 * This is useful for language-scoped read/create flows tied to a post.
 */
async function assertPostInLanguage(postId, language, { published } = {}) {
  const lang = normalizeLanguage(language);

  return prisma.blogPost.findFirst({
    where: {
      id: postId,
      language: lang,
      ...(typeof published === "boolean" ? { published } : {}),
    },
    select: {
      id: true,
      language: true,
      published: true,
    },
  });
}

/**
 * Create comment on a published post in the currently selected language.
 * Language is validated through the post, not stored on the comment itself.
 */
async function createComment(postId, authorId, body, { language } = {}) {
  const post = await assertPostInLanguage(postId, language, { published: true });

  if (!post) return null;

  return prisma.comment.create({
    data: {
      body,
      authorId,
      postId,
    },
    include: {
      user: { select: INCLUDED_IN_USER },
    },
  });
}

/**
 * Get paginated comments for a published post in the current language.
 * We validate the post language once, then fetch comments by postId only.
 */
async function getAllCommentsFromPost(
  postId,
  { language, page = 1, limit = 10, sort = "asc" } = {}
) {
  const lang = normalizeLanguage(language);

  const post = await assertPostInLanguage(postId, lang, { published: true });

  if (!post) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: Number(limit) || 10,
    };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const normalizedSort = sort?.toLowerCase() === "asc" ? "asc" : "desc";

  const where = {
    postId,
  };

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: normalizedSort },
      skip,
      take: parsedLimit,
      include: {
        user: { select: INCLUDED_IN_USER },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    items,
    total,
    page: parsedPage,
    limit: parsedLimit,
  };
}

/**
 * Get comment by id only.
 * Comment identity is global and should not depend on current UI language.
 */
async function getCommentById(commentId) {
  return prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      user: { select: INCLUDED_IN_USER },
    },
  });
}

/**
 * Delete comment by id only.
 * Authorization should be handled in the controller/service layer above this call.
 */
async function deleteComment(commentId) {
  const res = await prisma.comment.deleteMany({
    where: {
      id: commentId,
    },
  });

  return res.count > 0;
}

/**
 * Update comment by id only.
 * Language should not be part of comment mutation queries.
 */
async function updateComment(commentId, body) {
  const res = await prisma.comment.updateMany({
    where: {
      id: commentId,
    },
    data: {
      body,
    },
  });

  if (res.count === 0) return null;

  return prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      user: { select: INCLUDED_IN_USER },
    },
  });
}

export default {
  createComment,
  getAllCommentsFromPost,
  getCommentById,
  deleteComment,
  updateComment,
};