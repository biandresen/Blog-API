import prisma from "../config/prismaClient.js";
import { INCLUDED_IN_USER } from "../constants.js";

async function createComment(postId, authorId, body) {
  return await prisma.comment.create({
    data: {
      body,
      authorId,
      postId,
    },
  });
}

// async function getAllCommentsFromPost(postId, { page = 1, limit = 10, sort = "asc" } = {}) {
//   const parsedPage = parseInt(page) || 1;
//   const parsedLimit = parseInt(limit) || 10;
//   const skip = (parsedPage - 1) * parsedLimit;

//   return await prisma.comment.findMany({
//     where: { postId },
//     orderBy: {
//       createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
//     },
//     skip,
//     take: parsedLimit,
//     include: {
//       user: {
//         select: {
//           id: true,
//           username: true,
//         },
//       },
//     },
//   });
// }

async function getAllCommentsFromPost(postId, { page = 1, limit = 10, sort = "asc" } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const where = { postId };

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: {
        createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
      },
      skip,
      take: parsedLimit,
      include: {
        user: {
          select: INCLUDED_IN_USER
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return { items, total, page: parsedPage, limit: parsedLimit };
}

async function getCommentById(commentId) {
  return await prisma.comment.findUnique({
    where: { id: commentId },
  });
}

async function deleteComment(commentId) {
  return await prisma.comment.delete({
    where: { id: commentId },
  });
}

async function updateComment(commentId, body) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: {
      body,
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
