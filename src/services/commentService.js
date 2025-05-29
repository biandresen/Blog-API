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

export default {
  createComment,
  getAllCommentsFromPost,
};
