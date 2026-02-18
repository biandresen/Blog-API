import prisma from "../config/prismaClient.js";
import { Prisma } from "@prisma/client";

import { FEATURED_POST, INCLUDED_IN_USER } from "../constants.js";
import { startOfUtcDay } from "../utils/date.js";
import { deterministicIndex } from "../utils/deterministicIndex.js";
import badgeService from "./badgeService.js";

// async function getAllPosts({ page = 1, limit = 100, sort = "asc", tag = null } = {}) {
//   const parsedPage = parseInt(page) || 1;
//   const parsedLimit = parseInt(limit) || 100;
//   const skip = (parsedPage - 1) * parsedLimit;

//   return await prisma.blogPost.findMany({
//     where: {
//       published: true,
//       ...(tag?.length && {
//         tags: {
//           some: {
//             name: {
//               in: tag,
//             },
//           },
//         },
//       }),
//     },
//     orderBy: {
//       createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
//     },
//     skip,
//     take: parsedLimit,
//     include: {
//       tags: true,
//       likes: {
//         include: {
//           user: {
//             select: { id: true, username: true },
//           },
//         },
//       },
//       comments: {
//         orderBy: {
//           createdAt: "asc",
//         },
//         include: {
//           user: {
//             select: INCLUDED_IN_USER
//           },
//         },
//       },
//       user: {
//         select: INCLUDED_IN_USER
//       },
//     },
//   });
// }

async function getAllPosts({ page = 1, limit = 15, sort = "asc", tag = null } = {}) {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 15);
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {
    published: true,
    ...(tag?.length && {
      tags: {
        some: {
          name: { in: tag },
        },
      },
    }),
  };

  const orderBy = {
    createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
  };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy,
      skip,
      take: parsedLimit,
      include: {
        tags: true,
        likes: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: INCLUDED_IN_USER } },
        },
        user: { select: INCLUDED_IN_USER },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { items, total, page: parsedPage, limit: parsedLimit };
}


async function getAllDrafts({ page = 1, limit = 100, sort = "desc", tag = null } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 100;
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
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: INCLUDED_IN_USER
          },
        },
      },
      user: {
        select: INCLUDED_IN_USER
      },
    },
  });
}

// async function getAllPostsByAuthor(
//   authorId,
//   { page = 1, limit = 100, sort = "desc", tag = null, published = true } = {}
// ) {
//   const parsedPage = parseInt(page) || 1;
//   const parsedLimit = parseInt(limit) || 100;
//   const skip = (parsedPage - 1) * parsedLimit;

//   return await prisma.blogPost.findMany({
//     where: {
//       authorId,
//       ...(typeof published === "boolean" && { published }),
//       ...(tag?.length && {
//         tags: {
//           some: {
//             name: {
//               in: tag,
//             },
//           },
//         },
//       }),
//     },
//     orderBy: {
//       createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
//     },
//     skip,
//     take: parsedLimit,
//     include: {
//       tags: true,
//       likes: {
//         include: {
//           user: {
//             select: { id: true, username: true },
//           },
//         },
//       },
//       comments: {
//         orderBy: {
//           createdAt: "asc",
//         },
//         include: {
//           user: {
//             select: INCLUDED_IN_USER
//           },
//         },
//       },
//       user: {
//         select: INCLUDED_IN_USER
//       },
//     },
//   });
// }

async function getAllPostsByAuthor(
  authorId,
  { page = 1, limit = 15, sort = "desc", tag = null, published = true } = {}
) {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 15);
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {
    authorId,
    ...(typeof published === "boolean" && { published }),
    ...(tag?.length && {
      tags: {
        some: { name: { in: tag } },
      },
    }),
  };

  const orderBy = {
    createdAt: sort.toLowerCase() === "asc" ? "asc" : "desc",
  };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy,
      skip,
      take: parsedLimit,
      include: {
        tags: true,
        likes: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: INCLUDED_IN_USER } },
        },
        user: { select: INCLUDED_IN_USER },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { items, total, page: parsedPage, limit: parsedLimit };
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
      likes: {
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: INCLUDED_IN_USER
          },
        },
      },
      user: {
        select: INCLUDED_IN_USER
      },
    },
  });
}

async function getRandomPost() {
  const count = await prisma.blogPost.count({
    where: { published: true },
  });

  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);

  const [post] = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { id: "asc" },
    skip,
    take: 1,
    include: {
      tags: true,
      likes: {
        include: {
          user: { select: { id: true, username: true } },
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: INCLUDED_IN_USER
          },
        },
      },
      user: { select: INCLUDED_IN_USER },
    },
  });

  return post ?? null;
}

async function getDailyPost() {
  const dayUtc = startOfUtcDay(new Date());

  // 1) Already selected today?
  const existing = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.DAILY, date: dayUtc } },
    select: { postId: true },
  });

  if (existing?.postId) {
    // optional safety: ensure badge exists (idempotent anyway)
    // await badgeService.awardJokeOfTheDayToAuthor({ ... }) would require authorId;
    // to avoid extra query, you can skip this here.
    return getPostById(existing.postId);
  }

  // 2) Deterministic pick
  const count = await prisma.blogPost.count({ where: { published: true } });
  if (count === 0) return null;

  const index = deterministicIndex(dayUtc, count);

  const picked = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { id: "asc" },
    skip: index,
    take: 1,
    select: { id: true, authorId: true },
  });

  const post = picked[0];
  if (!post) return null;

  // 3) Persist selection + award badge once/day
  try {
    await prisma.featuredPost.create({
      data: { type: FEATURED_POST.DAILY, date: dayUtc, postId: post.id },
    });

    await badgeService.awardJokeOfTheDayToAuthor({
      authorId: post.authorId,
      postId: post.id,
      dayUtc,
    });
  } catch (e) {
    // If another request created it first
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) {
      throw e;
    }
  }

  return getPostById(post.id);
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
      set: [],
      connectOrCreate: tags.map((tagName) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }

  return prisma.blogPost.update({
    where: { id: postId },
    data: updateData,
    include: {
      tags: true,
      user: { select: INCLUDED_IN_USER},
      likes: {
        include: {
          user: { select: { id: true, username: true } },
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: INCLUDED_IN_USER
          },
        },
      },
    },
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

async function addLike(postId, userId) {
  return prisma.postLike.create({
    data: { postId, userId },
  });
}

async function removeLike(postId, userId) {
  return prisma.postLike.delete({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });
}

async function hasLiked(postId, userId) {
  return prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });
}

async function searchPosts(searchParameters, { page = 1, limit = 100, sort = "desc" } = {}) {
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
        select: INCLUDED_IN_USER
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
            select: INCLUDED_IN_USER
          },
        },
      },
    },
  });
}

async function getPopularPosts({ limit = 10, tag = null } = {}) {
  const parsedLimit = parseInt(limit) || 10;

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
    orderBy: [
      { likes: { _count: "desc" } }, // Most likes first
      { createdAt: "desc" }, // Tie-breaker: newest first
    ],
    take: parsedLimit,
    include: {
      tags: true,
      likes: {
        include: {
          user: { select: { id: true, username: true } },
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: INCLUDED_IN_USER
          },
        },
      },
      user: {
        select: INCLUDED_IN_USER
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
  getPopularPosts,
  getRandomPost,
  getDailyPost,
  addLike,
  removeLike,
  hasLiked,
};
