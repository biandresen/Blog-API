import prisma from "../config/prismaClient.js";
import { INCLUDED_IN_USER } from "../constants.js";
import { normalizeLanguage } from "../utils/language.js";

/**
 * Helper: ensures the post exists and belongs to the current language.
 * Also prevents commenting on the wrong language by ID.
 */
async function assertPostInLanguage(postId, language, { published } = {}) {
  const lang = normalizeLanguage(language);

  const post = await prisma.blogPost.findFirst({
    where: {
      id: postId,
      language: lang,
      ...(typeof published === "boolean" ? { published } : {}),
    },
    select: { id: true, language: true, published: true },
  });

  return post; // null if not found
}

async function createComment(postId, authorId, body, { language } = {}) {
  const lang = normalizeLanguage(language);

  // Enforce language partitioning
  const post = await assertPostInLanguage(postId, lang, { published: true });
  if (!post) return null;

  // If you added Comment.language, set it. If you did not, remove language from data.
  return prisma.comment.create({
    data: {
      body,
      authorId,
      postId,
      language: lang,
    },
    include: {
      user: { select: INCLUDED_IN_USER },
    },
  });
}

async function getAllCommentsFromPost(
  postId,
  { language, page = 1, limit = 10, sort = "asc" } = {}
) {
  const lang = normalizeLanguage(language);

  // Enforce that the post belongs to this language
  const post = await assertPostInLanguage(postId, lang, { published: true });
  if (!post) return { items: [], total: 0, page: 1, limit: Number(limit) || 10, language: lang };

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {
  postId,
  language: lang,
};

const [items, total] = await Promise.all([
  prisma.comment.findMany({
    where,
    orderBy: { createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc" },
    skip,
    take: parsedLimit,
    include: {
      user: { select: INCLUDED_IN_USER },
    },
  }),
  prisma.comment.count({ where }),
]);

  return { items, total, page: parsedPage, limit: parsedLimit, language: lang };
}

/**
 * Language-safe "get by id":
 * - Never allow `findUnique({ id })` alone because it bypasses language partitioning
 * - Scope via relation: comment.post.language
 */
async function getCommentById(commentId, { language } = {}) {
  const lang = normalizeLanguage(language);

  return prisma.comment.findFirst({
    where: {
      id: commentId,
      post: { language: lang },
      // If you added Comment.language:
      // language: lang,
    },
    include: {
      user: { select: INCLUDED_IN_USER },
    },
  });
}

/**
 * Use deleteMany/updateMany so language is part of WHERE and cannot be bypassed.
 */
async function deleteComment(commentId, { language } = {}) {
  const lang = normalizeLanguage(language);

  const res = await prisma.comment.deleteMany({
    where: {
      id: commentId,
      post: { language: lang },
      // language: lang,
    },
  });

  return res.count > 0;
}

async function updateComment(commentId, body, { language } = {}) {
  const lang = normalizeLanguage(language);

  const res = await prisma.comment.updateMany({
    where: {
      id: commentId,
      post: { language: lang },
      // language: lang,
    },
    data: { body },
  });

  if (res.count === 0) return null;

  return getCommentById(commentId, { language: lang });
}

export default {
  createComment,
  getAllCommentsFromPost,
  getCommentById,
  deleteComment,
  updateComment,
};