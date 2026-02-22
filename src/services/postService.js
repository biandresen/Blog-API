import prisma from "../config/prismaClient.js";
import { Prisma } from "@prisma/client";

import { FEATURED_POST, INCLUDED_IN_USER } from "../constants.js";
import { startOfUtcDay, addUtcDays, startOfUtcWeek, startOfUtcHour, addUtcHours  } from "../utils/date.js";
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
  const yesterdayUtc = startOfUtcDay(new Date(dayUtc.getTime() - 24 * 60 * 60 * 1000));

  // 1) Already selected today?
  const existing = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.DAILY, date: dayUtc } },
    select: { postId: true },
  });

  if (existing?.postId) return getPostById(existing.postId);

  // 2) Get yesterday's selected postId (if any)
  const yesterday = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.DAILY, date: yesterdayUtc } },
    select: { postId: true },
  });
  const yesterdayPostId = yesterday?.postId ?? null;

  // 3) Count published posts (optionally excluding yesterday)
  const whereBase = { published: true };
  const whereExcludingYesterday =
    yesterdayPostId != null ? { ...whereBase, id: { not: yesterdayPostId } } : whereBase;

  // If we can exclude yesterday, do it. If not (e.g. only 1 post), fall back.
  const totalExcl = await prisma.blogPost.count({ where: whereExcludingYesterday });
  const canExcludeYesterday = yesterdayPostId != null && totalExcl > 0;

  const finalWhere = canExcludeYesterday ? whereExcludingYesterday : whereBase;
  const total = canExcludeYesterday ? totalExcl : await prisma.blogPost.count({ where: whereBase });

  if (total === 0) return null;

  // 4) Deterministic pick (now on the filtered set if possible)
  const index = deterministicIndex(dayUtc, total);

  const picked = await prisma.blogPost.findMany({
    where: finalWhere,
    orderBy: { id: "asc" },
    skip: index,
    take: 1,
    select: { id: true, authorId: true },
  });

  const post = picked[0];
  if (!post) return null;

  // 5) Persist selection + award badge once/day
  try {
    await prisma.featuredPost.create({
      data: { type: FEATURED_POST.DAILY, date: dayUtc, postId: post.id },
    });

    await badgeService.awardJokeOfTheDayToAuthor({
      authorId: post.authorId,
      postId: post.id,
      dayUtc, // keep naming consistent
    });
  } catch (e) {
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

export async function computeMostCommentedThisWeek() {
  const weekStartUtc = startOfUtcWeek(new Date());
  const weekEndUtc = addUtcDays(weekStartUtc, 7);

  // already computed for this week?
  const existing = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.MOST_COMMENTED_WEEK, date: weekStartUtc } },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  // group comments by postId within the week
  const rows = await prisma.comment.groupBy({
    by: ["postId"],
    where: {
      createdAt: { gte: weekStartUtc, lt: weekEndUtc },
      post: { published: true }, // <-- relation filter (valid in Prisma)
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const commentCount = rows[0]?._count?.id ?? 0;
  if (!winnerPostId || commentCount === 0) return null;

  // get authorId for awarding badge
  const winnerPost = await prisma.blogPost.findUnique({
    where: { id: winnerPostId },
    select: { id: true, authorId: true },
  });
  if (!winnerPost) return null;

  try {
    await prisma.featuredPost.create({
      data: {
        type: FEATURED_POST.MOST_COMMENTED_WEEK,
        date: weekStartUtc,
        postId: winnerPost.id,
      },
    });

    await badgeService.awardMostCommentedWeekToAuthor({
      authorId: winnerPost.authorId,
      postId: winnerPost.id,
      weekStartUtc,
      weekEndUtc,
      commentCount,
    });
  } catch (e) {
    // concurrency safe
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return winnerPost.id;
}

export async function computeTrendingThisWeek() {
  const weekStartUtc = startOfUtcWeek(new Date());
  const weekEndUtc = addUtcDays(weekStartUtc, 7);

  // already computed?
  const existing = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.TRENDING_WEEK, date: weekStartUtc } },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  // group likes by postId this week
  const rows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: {
      createdAt: { gte: weekStartUtc, lt: weekEndUtc },
      post: { published: true },
    },
    _count: { postId: true }, // count likes (rows)
    orderBy: { _count: { postId: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const likeCount = rows[0]?._count?.postId ?? 0;
  if (!winnerPostId || likeCount === 0) return null;

  const winnerPost = await prisma.blogPost.findUnique({
    where: { id: winnerPostId },
    select: { id: true, authorId: true },
  });
  if (!winnerPost) return null;

  try {
    await prisma.featuredPost.create({
      data: { type: FEATURED_POST.TRENDING_WEEK, date: weekStartUtc, postId: winnerPost.id },
    });

    await badgeService.awardTrendingWeekToAuthor({
      authorId: winnerPost.authorId,
      postId: winnerPost.id,
      weekStartUtc,
      weekEndUtc,
      likeCount,
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return winnerPost.id;
}

export async function computeFastestGrowing24h() {
  const now = new Date();
  const hourKeyUtc = startOfUtcHour(now);          // FeaturedPost.date key
  const windowStart = addUtcHours(now, -24);       // rolling window
  const validFromUtc = hourKeyUtc;
  const validToUtc = addUtcHours(hourKeyUtc, 24);

  // Already computed for this hour?
  const existing = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.FASTEST_GROWING, date: hourKeyUtc } },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  // Likes grouped by postId in the last 24h
  const rows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: {
      createdAt: { gte: windowStart, lt: now },
      post: { published: true },
    },
    _count: { postId: true },
    orderBy: { _count: { postId: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const likeCount24h = rows[0]?._count?.postId ?? 0;
  if (!winnerPostId || likeCount24h === 0) return null;

  const winnerPost = await prisma.blogPost.findUnique({
    where: { id: winnerPostId },
    select: { id: true, authorId: true },
  });
  if (!winnerPost) return null;

  try {
    await prisma.featuredPost.create({
      data: { type: FEATURED_POST.FASTEST_GROWING, date: hourKeyUtc, postId: winnerPost.id },
    });

    await badgeService.awardFastestGrowingToAuthor({
      authorId: winnerPost.authorId,
      postId: winnerPost.id,
      validFromUtc,
      validToUtc,
      likeCount24h,
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return winnerPost.id;
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
  computeMostCommentedThisWeek,
  computeTrendingThisWeek,
  computeFastestGrowing24h,
  addLike,
  removeLike,
  hasLiked,
};
