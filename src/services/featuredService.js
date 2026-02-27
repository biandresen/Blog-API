import { Prisma } from "@prisma/client";
import prisma from "../config/prismaClient.js";
import { FEATURED_POST } from "../constants.js";
import badgeService from "./badgeService.js";
import { startOfUtcMonth, addUtcMonths, startOfUtcWeek, addUtcDays, startOfUtcHour, addUtcHours } from "../utils/date.js";
import postService from "./postService.js"; // for getPostById

export async function computeTopCreatorThisMonth() {
  const monthStartUtc = startOfUtcMonth(new Date());
  const monthEndUtc = addUtcMonths(monthStartUtc, 1);

  // 1) Already computed this month?
  const existing = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.TOP_CREATOR_MONTH, date: monthStartUtc } },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  // 2) Find top author by number of published posts this month
  const rows = await prisma.blogPost.groupBy({
    by: ["authorId"],
    where: {
      published: true,
      createdAt: { gte: monthStartUtc, lt: monthEndUtc },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const winnerAuthorId = rows[0]?.authorId ?? null;
  const postCount = rows[0]?._count?.id ?? 0;

  if (!winnerAuthorId || postCount === 0) return null;

  // 3) Representative post for context (latest published this month)
  const latest = await prisma.blogPost.findFirst({
    where: {
      authorId: winnerAuthorId,
      published: true,
      createdAt: { gte: monthStartUtc, lt: monthEndUtc },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!latest?.id) return null;

  // 4) Persist + award badge (concurrency safe)
  try {
    await prisma.featuredPost.create({
      data: {
        type: FEATURED_POST.TOP_CREATOR_MONTH,
        date: monthStartUtc,
        postId: latest.id,
      },
    });

    await badgeService.awardTopCreatorMonthToUser({
      userId: winnerAuthorId,
      monthStartUtc,
      monthEndUtc,
      postCount,
      context: { postId: latest.id },
    });
  } catch (e) {
    // Someone else computed first
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return latest.id;
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

export async function getCurrentFeatured(type) {
  const row = await prisma.featuredPost.findFirst({
    where: { type },
    orderBy: { date: "desc" },
    select: { postId: true, date: true },
  });

  if (!row) return null;

  const post = await postService.getPostById(row.postId, { published: true });
  return { post, date: row.date };
}

export default {
  computeTopCreatorThisMonth,
  computeMostCommentedThisWeek,
  computeTrendingThisWeek,
  computeFastestGrowing24h,
  getCurrentFeatured
}