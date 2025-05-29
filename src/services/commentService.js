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

export default {
  createComment,
};
