import prisma from "../config/prismaClient.js";

async function getAllPosts({ page = 1, limit = 10, sort = "desc", tag = null } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  return await prisma.blogPost.findMany({
    where: {
      published: true,
      ...(tag && {
        tags: {
          some: {
            name: tag,
          },
        },
      }),
    },
    orderBy: {
      createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
    },
    skip,
    take: parsedLimit,
    include: {
      tags: true,
      comments: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
}

async function getAllPostsByUser(userId, { page = 1, limit = 10, sort = "desc", tag = null } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  return await prisma.blogPost.findMany({
    where: {
      authorId: userId,
      published: true,
      ...(tag && {
        tags: {
          some: {
            name: tag,
          },
        },
      }),
    },
    orderBy: {
      createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
    },
    skip,
    take: parsedLimit,
    include: {
      tags: true,
      comments: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
}

export default {
  getAllPosts,
  getAllPostsByUser,
};
