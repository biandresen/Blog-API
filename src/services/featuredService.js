import { Prisma } from "@prisma/client";
import prisma from "../config/prismaClient.js";
import { FEATURED_POST } from "../constants.js";
import badgeService from "./badgeService.js";
import {
  startOfUtcMonth,
  addUtcMonths,
  startOfUtcWeek,
  addUtcDays,
  startOfUtcHour,
  addUtcHours,
} from "../utils/date.js";
import postService from "./postService.js"; // getPostById is language-scoped now
import { normalizeLanguage } from "../utils/language.js";

/**
 * NOTE:
 * This file is now language-aware.
 * - Every compute fn accepts { language }
 * - Every FeaturedPost lookup/upsert includes language
 * - Every source query filters BlogPost.language (and optionally Comment/PostLike.language)
 */

export async function computeTopCreatorThisMonth({ language } = {}) {
  const lang = normalizeLanguage(language);

  const monthStartUtc = startOfUtcMonth(new Date());
  const monthEndUtc = addUtcMonths(monthStartUtc, 1);

  // 1) Already computed this month for this language?
  const existing = await prisma.featuredPost.findUnique({
    where: {
      type_date_language: {
        type: FEATURED_POST.TOP_CREATOR_MONTH,
        date: monthStartUtc,
        language: lang,
      },
    },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  // 2) Find top author by number of published posts this month (language scoped)
  const rows = await prisma.blogPost.groupBy({
    by: ["authorId"],
    where: {
      language: lang,
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

  // 3) Representative post (latest published in window, language scoped)
  const latest = await prisma.blogPost.findFirst({
    where: {
      language: lang,
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
        language: lang,
      },
    });

    await badgeService.awardTopCreatorMonthToUser({
      userId: winnerAuthorId,
      monthStartUtc,
      monthEndUtc,
      postCount,
      context: { postId: latest.id, language: lang },
      language: lang,
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return latest.id;
}

export async function computeMostCommentedThisWeek({ language } = {}) {
  const lang = normalizeLanguage(language);

  const weekStartUtc = startOfUtcWeek(new Date());
  const weekEndUtc = addUtcDays(weekStartUtc, 7);

  // 1) Already computed for this week for this language?
  const existing = await prisma.featuredPost.findUnique({
    where: {
      type_date_language: {
        type: FEATURED_POST.MOST_COMMENTED_WEEK,
        date: weekStartUtc,
        language: lang,
      },
    },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  /**
   * Source query options:
   * A) If Comment has language column -> filter directly (fast, no join needed).
   * B) If Comment has NO language column -> filter via relation `post.language`.
   *
   * The schema we discussed adds Comment.language, but this works either way.
   */
  const commentWhere = {
    createdAt: { gte: weekStartUtc, lt: weekEndUtc },
    post: { published: true, language: lang },
    // If you added Comment.language in schema, you can also uncomment:
    // language: lang,
  };

  // 2) Group comments by postId within the week (language scoped)
  const rows = await prisma.comment.groupBy({
    by: ["postId"],
    where: commentWhere,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const commentCount = rows[0]?._count?.id ?? 0;
  if (!winnerPostId || commentCount === 0) return null;

  // 3) Fetch authorId (language scoped)
  const winnerPost = await prisma.blogPost.findFirst({
    where: { id: winnerPostId, language: lang },
    select: { id: true, authorId: true },
  });
  if (!winnerPost) return null;

  // 4) Persist + award badge
  try {
    await prisma.featuredPost.create({
      data: {
        type: FEATURED_POST.MOST_COMMENTED_WEEK,
        date: weekStartUtc,
        postId: winnerPost.id,
        language: lang,
      },
    });

    await badgeService.awardMostCommentedWeekToAuthor({
      authorId: winnerPost.authorId,
      postId: winnerPost.id,
      weekStartUtc,
      weekEndUtc,
      commentCount,
      language: lang,
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return winnerPost.id;
}

export async function computeTrendingThisWeek({ language } = {}) {
  const lang = normalizeLanguage(language);

  const weekStartUtc = startOfUtcWeek(new Date());
  const weekEndUtc = addUtcDays(weekStartUtc, 7);

  // 1) Already computed for this week for this language?
  const existing = await prisma.featuredPost.findUnique({
    where: {
      type_date_language: {
        type: FEATURED_POST.TRENDING_WEEK,
        date: weekStartUtc,
        language: lang,
      },
    },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  /**
   * Same note as comments: if PostLike has language column you can filter directly.
   * We still include relation filter to be safe and to enforce "published".
   */
  const likeWhere = {
    createdAt: { gte: weekStartUtc, lt: weekEndUtc },
    post: { published: true, language: lang },
    // If you added PostLike.language in schema, you can also uncomment:
    // language: lang,
  };

  // 2) Group likes by postId this week (language scoped)
  const rows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: likeWhere,
    _count: { postId: true },
    orderBy: { _count: { postId: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const likeCount = rows[0]?._count?.postId ?? 0;
  if (!winnerPostId || likeCount === 0) return null;

  // 3) Fetch authorId (language scoped)
  const winnerPost = await prisma.blogPost.findFirst({
    where: { id: winnerPostId, language: lang },
    select: { id: true, authorId: true },
  });
  if (!winnerPost) return null;

  // 4) Persist + award badge
  try {
    await prisma.featuredPost.create({
      data: {
        type: FEATURED_POST.TRENDING_WEEK,
        date: weekStartUtc,
        postId: winnerPost.id,
        language: lang,
      },
    });

    await badgeService.awardTrendingWeekToAuthor({
      authorId: winnerPost.authorId,
      postId: winnerPost.id,
      weekStartUtc,
      weekEndUtc,
      likeCount,
      language: lang,
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return winnerPost.id;
}

export async function computeFastestGrowing24h({ language } = {}) {
  const lang = normalizeLanguage(language);

  const now = new Date();
  const hourKeyUtc = startOfUtcHour(now); // FeaturedPost.date key
  const windowStart = addUtcHours(now, -24); // rolling window
  const validFromUtc = hourKeyUtc;
  const validToUtc = addUtcHours(hourKeyUtc, 24);

  // 1) Already computed for this hour for this language?
  const existing = await prisma.featuredPost.findUnique({
    where: {
      type_date_language: {
        type: FEATURED_POST.FASTEST_GROWING,
        date: hourKeyUtc,
        language: lang,
      },
    },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  const likeWhere = {
    createdAt: { gte: windowStart, lt: now },
    post: { published: true, language: lang },
    // If PostLike.language exists:
    // language: lang,
  };

  // 2) Likes grouped by postId in last 24h (language scoped)
  const rows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: likeWhere,
    _count: { postId: true },
    orderBy: { _count: { postId: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const likeCount24h = rows[0]?._count?.postId ?? 0;
  if (!winnerPostId || likeCount24h === 0) return null;

  // 3) Fetch authorId (language scoped)
  const winnerPost = await prisma.blogPost.findFirst({
    where: { id: winnerPostId, language: lang },
    select: { id: true, authorId: true },
  });
  if (!winnerPost) return null;

  // 4) Persist + award badge
  try {
    await prisma.featuredPost.create({
      data: {
        type: FEATURED_POST.FASTEST_GROWING,
        date: hourKeyUtc,
        postId: winnerPost.id,
        language: lang,
      },
    });

    await badgeService.awardFastestGrowingToAuthor({
      authorId: winnerPost.authorId,
      postId: winnerPost.id,
      validFromUtc,
      validToUtc,
      likeCount24h,
      language: lang,
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return winnerPost.id;
}

export async function getCurrentFeatured(type, { language } = {}) {
  const lang = normalizeLanguage(language);

  const row = await prisma.featuredPost.findFirst({
    where: { type, language: lang },
    orderBy: { date: "desc" },
    select: { postId: true, date: true },
  });

  if (!row) return null;

  const post = await postService.getPostById(row.postId, { language: lang, published: true });
  return { post, date: row.date, language: lang };
}

export default {
  computeTopCreatorThisMonth,
  computeMostCommentedThisWeek,
  computeTrendingThisWeek,
  computeFastestGrowing24h,
  getCurrentFeatured,
};