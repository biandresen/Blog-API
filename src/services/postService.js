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
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
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

async function getAllDrafts({ page = 1, limit = 10, sort = "desc", tag = null } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  return await prisma.blogPost.findMany({
    where: {
      published: false,
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

async function getAllPostsByAuthor(
  authorId,
  { page = 1, limit = 10, sort = "desc", tag = null, published = true } = {}
) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  return await prisma.blogPost.findMany({
    where: {
      authorId,
      ...(typeof published === "boolean" && { published }),
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

async function getPostById(postId, { published } = {}) {
  const whereClause = { id: postId };

  if (typeof published === "boolean") {
    whereClause.published = published;
  }

  return await prisma.blogPost.findUnique({
    where: whereClause,
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

async function deletePost(postId) {
  return await prisma.blogPost.delete({
    where: { id: postId },
  });
}

async function publishDraft(postId) {
  return await prisma.blogPost.update({
    where: { id: postId },
    data: {
      published: true,
    },
  });
}

async function searchPosts(searchParameters, { page = 1, limit = 10, sort = "desc" } = {}) {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const orConditions = searchParameters.flatMap((term) => [
    {
      title: {
        contains: term,
        mode: "insensitive",
      },
    },
    {
      body: {
        contains: term,
        mode: "insensitive",
      },
    },
    {
      tags: {
        some: {
          name: {
            contains: term,
            mode: "insensitive",
          },
        },
      },
    },
  ]);

  return await prisma.blogPost.findMany({
    where: {
      published: true,
      OR: orConditions,
    },
    orderBy: {
      createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
    },
    skip,
    take: parsedLimit,
    include: {
      tags: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });
}

export default {
  getAllPosts,
  getAllDrafts,
  getAllPostsByAuthor,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishDraft,
  searchPosts,
};
