import prisma from "../config/prismaClient.js";

async function createComment(postId, authorId, body) {
  return await prisma.comment.create({
    data: {
      body,
      authorId,
      postId,
    },
  });
}

async function getAllCommentsFromPost(postId) {
  return await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
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

export default {
  createComment,
  getAllCommentsFromPost,
  getCommentById,
  deleteComment,
};
