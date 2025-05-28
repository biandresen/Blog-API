import prisma from "../config/prismaClient.js";

async function getAllPosts({ page = 1, limit = 10, sort = "desc", tag = null } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  return await prisma.blogPost.findMany({
    where: {
      published: true,
      ...(tag?.length && {
        tags: {
          some: {
            name: {
              in: tag,
            },
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
      published: true,
      ...(tag?.length && {
        tags: {
          some: {
            name: {
              in: tag,
            },
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

async function getPostById(postId, { includeUnpublished = false } = {}) {
  const where = { id: postId };
  if (!includeUnpublished) {
    where.published = true;
  }

  return await prisma.blogPost.findFirst({ where });
}

async function getPostsByAuthor(authorId, { publishedOnly = true } = {}) {
  const where = { authorId };
  if (publishedOnly) {
    where.published = true;
  }

  return await prisma.blogPost.findMany({ where });
}

async function createPost(authorId, title = "Title", body = "Body...", published = false, tags = []) {
  return await prisma.blogPost.create({
    data: {
      authorId,
      title,
      body,
      published,
      tags: {
        connectOrCreate: tags.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    },
    include: {
      tags: true,
    },
  });
}

async function updatePost(postId, { title, body, published, tags }) {
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (body !== undefined) updateData.body = body;
  if (published !== undefined) updateData.published = published;

  if (tags !== undefined) {
    updateData.tags = {
      set: [], // Remove all old tags
      connectOrCreate: tags.map((tagName) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }

  return await prisma.blogPost.update({
    where: { id: postId },
    data: updateData,
    include: { tags: true },
  });
}

export default {
  getAllPosts,
  getAllPostsByUser,
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
};
