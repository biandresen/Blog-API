import { Prisma } from "@prisma/client";
import prisma from "../config/prismaClient.js";
import { FEATURED_POST } from "../constants.js";
import badgeService from "./badgeService.js";
import logger from "../config/logger.js";
import {
  startOfUtcMonth,
  addUtcMonths,
  startOfUtcWeek,
  addUtcDays,
  startOfUtcHour,
  addUtcHours,
  startOfUtcDay
} from "../utils/date.js";
import postService from "./postService.js";
import { normalizeLanguage } from "../utils/language.js";

function deterministicIndex(dayUtc, total) {
  const dayNumber = Math.floor(dayUtc.getTime() / (24 * 60 * 60 * 1000));
  return dayNumber % total;
}

export async function computeDailyJoke({ language } = {}) {
  const lang = normalizeLanguage(language);

  const dayUtc = startOfUtcDay(new Date());
  const yesterdayUtc = startOfUtcDay(
    new Date(dayUtc.getTime() - 24 * 60 * 60 * 1000)
  );

  const existing = await prisma.featuredPost.findUnique({
    where: {
      type_date_language: {
        type: FEATURED_POST.DAILY,
        date: dayUtc,
        language: lang,
      },
    },
    select: { postId: true },
  });

  if (existing?.postId) {
    logger.info(
      {
        event: "featured_compute_skipped_existing",
        featureType: FEATURED_POST.DAILY,
        language: lang,
        date: dayUtc,
        postId: existing.postId,
      },
      "Daily joke already computed"
    );

    return {
      status: "already_exists",
      postId: existing.postId,
      language: lang,
    };
  }

  const yesterday = await prisma.featuredPost.findUnique({
    where: {
      type_date_language: {
        type: FEATURED_POST.DAILY,
        date: yesterdayUtc,
        language: lang,
      },
    },
    select: { postId: true },
  });

  const yesterdayPostId = yesterday?.postId ?? null;

  const whereBase = {
    language: lang,
    published: true,
  };

  const whereExcludingYesterday =
    yesterdayPostId != null
      ? { ...whereBase, id: { not: yesterdayPostId } }
      : whereBase;

  const totalExcl = await prisma.blogPost.count({
    where: whereExcludingYesterday,
  });

  const canExcludeYesterday = yesterdayPostId != null && totalExcl > 0;
  const finalWhere = canExcludeYesterday ? whereExcludingYesterday : whereBase;
  const total = canExcludeYesterday
    ? totalExcl
    : await prisma.blogPost.count({ where: whereBase });

  if (total === 0) {
    logger.info(
      {
        event: "featured_compute_no_winner",
        featureType: FEATURED_POST.DAILY,
        language: lang,
        date: dayUtc,
      },
      "No daily joke candidate found"
    );

    return {
      status: "no_winner",
      postId: null,
      language: lang,
    };
  }

  const index = deterministicIndex(dayUtc, total);

  const picked = await prisma.blogPost.findMany({
    where: finalWhere,
    orderBy: { id: "asc" },
    skip: index,
    take: 1,
    select: { id: true, authorId: true },
  });

  const post = picked[0];
  if (!post) {
    logger.warn(
      {
        event: "featured_compute_missing_pick",
        featureType: FEATURED_POST.DAILY,
        language: lang,
        date: dayUtc,
        index,
        total,
      },
      "Daily joke selection produced no post"
    );

    return {
      status: "missing_pick",
      postId: null,
      language: lang,
    };
  }

  try {
    await prisma.featuredPost.create({
      data: {
        type: FEATURED_POST.DAILY,
        date: dayUtc,
        postId: post.id,
        language: lang,
      },
    });

    await badgeService.awardJokeOfTheDayToAuthor({
      authorId: post.authorId,
      postId: post.id,
      dayUtc,
      language: lang,
    });

    logger.info(
      {
        event: "featured_compute_created",
        featureType: FEATURED_POST.DAILY,
        language: lang,
        date: dayUtc,
        postId: post.id,
        authorId: post.authorId,
      },
      "Daily joke computed and badge awarded"
    );

    return {
      status: "created",
      postId: post.id,
      authorId: post.authorId,
      language: lang,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      logger.warn(
        {
          event: "featured_compute_race_condition",
          featureType: FEATURED_POST.DAILY,
          language: lang,
          date: dayUtc,
          postId: post.id,
        },
        "Daily joke already created by another concurrent process"
      );

      return {
        status: "duplicate_race",
        postId: post.id,
        language: lang,
      };
    }

    throw e;
  }
}

export async function computeTopCreatorThisMonth({ language } = {}) {
  const lang = normalizeLanguage(language);

  const monthStartUtc = startOfUtcMonth(new Date());
  const monthEndUtc = addUtcMonths(monthStartUtc, 1);

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

  if (existing?.postId) {
    logger.info(
      {
        event: "featured_compute_skipped_existing",
        featureType: FEATURED_POST.TOP_CREATOR_MONTH,
        language: lang,
        date: monthStartUtc,
        postId: existing.postId,
      },
      "Top creator month already computed"
    );

    return {
      status: "already_exists",
      postId: existing.postId,
      language: lang,
    };
  }

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

  if (!winnerAuthorId || postCount === 0) {
    logger.info(
      {
        event: "featured_compute_no_winner",
        featureType: FEATURED_POST.TOP_CREATOR_MONTH,
        language: lang,
        date: monthStartUtc,
      },
      "No top creator month winner found"
    );

    return {
      status: "no_winner",
      postId: null,
      language: lang,
    };
  }

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

  if (!latest?.id) {
    logger.warn(
      {
        event: "featured_compute_missing_representative_post",
        featureType: FEATURED_POST.TOP_CREATOR_MONTH,
        language: lang,
        winnerAuthorId,
      },
      "Winner author had no representative post"
    );

    return {
      status: "missing_representative_post",
      postId: null,
      language: lang,
    };
  }

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

    logger.info(
      {
        event: "featured_compute_created",
        featureType: FEATURED_POST.TOP_CREATOR_MONTH,
        language: lang,
        date: monthStartUtc,
        postId: latest.id,
        winnerAuthorId,
        postCount,
      },
      "Top creator month computed and badge awarded"
    );

    return {
      status: "created",
      postId: latest.id,
      winnerAuthorId,
      postCount,
      language: lang,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      logger.warn(
        {
          event: "featured_compute_race_condition",
          featureType: FEATURED_POST.TOP_CREATOR_MONTH,
          language: lang,
          date: monthStartUtc,
          postId: latest.id,
        },
        "Top creator month already created by another concurrent process"
      );

      return {
        status: "duplicate_race",
        postId: latest.id,
        language: lang,
      };
    }

    throw e;
  }
}

export async function computeMostCommentedThisWeek({ language } = {}) {
  const lang = normalizeLanguage(language);

  const weekStartUtc = startOfUtcWeek(new Date());
  const weekEndUtc = addUtcDays(weekStartUtc, 7);

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

  if (existing?.postId) {
    logger.info(
      {
        event: "featured_compute_skipped_existing",
        featureType: FEATURED_POST.MOST_COMMENTED_WEEK,
        language: lang,
        date: weekStartUtc,
        postId: existing.postId,
      },
      "Most commented week already computed"
    );

    return {
      status: "already_exists",
      postId: existing.postId,
      language: lang,
    };
  }

  const commentWhere = {
    createdAt: { gte: weekStartUtc, lt: weekEndUtc },
    post: { published: true, language: lang },
  };

  const rows = await prisma.comment.groupBy({
    by: ["postId"],
    where: commentWhere,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const commentCount = rows[0]?._count?.id ?? 0;

  if (!winnerPostId || commentCount === 0) {
    logger.info(
      {
        event: "featured_compute_no_winner",
        featureType: FEATURED_POST.MOST_COMMENTED_WEEK,
        language: lang,
        date: weekStartUtc,
      },
      "No most commented week winner found"
    );

    return {
      status: "no_winner",
      postId: null,
      language: lang,
    };
  }

  const winnerPost = await prisma.blogPost.findFirst({
    where: { id: winnerPostId, language: lang },
    select: { id: true, authorId: true },
  });

  if (!winnerPost) {
    logger.warn(
      {
        event: "featured_compute_missing_post",
        featureType: FEATURED_POST.MOST_COMMENTED_WEEK,
        language: lang,
        date: weekStartUtc,
        winnerPostId,
      },
      "Most commented week winner post not found"
    );

    return {
      status: "missing_post",
      postId: null,
      language: lang,
    };
  }

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

    logger.info(
      {
        event: "featured_compute_created",
        featureType: FEATURED_POST.MOST_COMMENTED_WEEK,
        language: lang,
        date: weekStartUtc,
        postId: winnerPost.id,
        authorId: winnerPost.authorId,
        commentCount,
      },
      "Most commented week computed and badge awarded"
    );

    return {
      status: "created",
      postId: winnerPost.id,
      authorId: winnerPost.authorId,
      commentCount,
      language: lang,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      logger.warn(
        {
          event: "featured_compute_race_condition",
          featureType: FEATURED_POST.MOST_COMMENTED_WEEK,
          language: lang,
          date: weekStartUtc,
          postId: winnerPost.id,
        },
        "Most commented week already created by another concurrent process"
      );

      return {
        status: "duplicate_race",
        postId: winnerPost.id,
        language: lang,
      };
    }

    throw e;
  }
}

export async function computeTrendingThisWeek({ language } = {}) {
  const lang = normalizeLanguage(language);

  const weekStartUtc = startOfUtcWeek(new Date());
  const weekEndUtc = addUtcDays(weekStartUtc, 7);

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

  if (existing?.postId) {
    logger.info(
      {
        event: "featured_compute_skipped_existing",
        featureType: FEATURED_POST.TRENDING_WEEK,
        language: lang,
        date: weekStartUtc,
        postId: existing.postId,
      },
      "Trending week already computed"
    );

    return {
      status: "already_exists",
      postId: existing.postId,
      language: lang,
    };
  }

  const likeWhere = {
    createdAt: { gte: weekStartUtc, lt: weekEndUtc },
    post: { published: true, language: lang },
  };

  const rows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: likeWhere,
    _count: { postId: true },
    orderBy: { _count: { postId: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const likeCount = rows[0]?._count?.postId ?? 0;

  if (!winnerPostId || likeCount === 0) {
    logger.info(
      {
        event: "featured_compute_no_winner",
        featureType: FEATURED_POST.TRENDING_WEEK,
        language: lang,
        date: weekStartUtc,
      },
      "No trending week winner found"
    );

    return {
      status: "no_winner",
      postId: null,
      language: lang,
    };
  }

  const winnerPost = await prisma.blogPost.findFirst({
    where: { id: winnerPostId, language: lang },
    select: { id: true, authorId: true },
  });

  if (!winnerPost) {
    logger.warn(
      {
        event: "featured_compute_missing_post",
        featureType: FEATURED_POST.TRENDING_WEEK,
        language: lang,
        date: weekStartUtc,
        winnerPostId,
      },
      "Trending week winner post not found"
    );

    return {
      status: "missing_post",
      postId: null,
      language: lang,
    };
  }

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

    logger.info(
      {
        event: "featured_compute_created",
        featureType: FEATURED_POST.TRENDING_WEEK,
        language: lang,
        date: weekStartUtc,
        postId: winnerPost.id,
        authorId: winnerPost.authorId,
        likeCount,
      },
      "Trending week computed and badge awarded"
    );

    return {
      status: "created",
      postId: winnerPost.id,
      authorId: winnerPost.authorId,
      likeCount,
      language: lang,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      logger.warn(
        {
          event: "featured_compute_race_condition",
          featureType: FEATURED_POST.TRENDING_WEEK,
          language: lang,
          date: weekStartUtc,
          postId: winnerPost.id,
        },
        "Trending week already created by another concurrent process"
      );

      return {
        status: "duplicate_race",
        postId: winnerPost.id,
        language: lang,
      };
    }

    throw e;
  }
}

export async function computeFastestGrowing24h({ language } = {}) {
  const lang = normalizeLanguage(language);

  const now = new Date();
  const hourKeyUtc = startOfUtcHour(now);
  const windowStart = addUtcHours(now, -24);
  const validFromUtc = hourKeyUtc;
  const validToUtc = addUtcHours(hourKeyUtc, 24);

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

  if (existing?.postId) {
    logger.info(
      {
        event: "featured_compute_skipped_existing",
        featureType: FEATURED_POST.FASTEST_GROWING,
        language: lang,
        date: hourKeyUtc,
        postId: existing.postId,
      },
      "Fastest growing 24h already computed"
    );

    return {
      status: "already_exists",
      postId: existing.postId,
      language: lang,
    };
  }

  const likeWhere = {
    createdAt: { gte: windowStart, lt: now },
    post: { published: true, language: lang },
  };

  const rows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: likeWhere,
    _count: { postId: true },
    orderBy: { _count: { postId: "desc" } },
    take: 1,
  });

  const winnerPostId = rows[0]?.postId ?? null;
  const likeCount24h = rows[0]?._count?.postId ?? 0;

  if (!winnerPostId || likeCount24h === 0) {
    logger.info(
      {
        event: "featured_compute_no_winner",
        featureType: FEATURED_POST.FASTEST_GROWING,
        language: lang,
        date: hourKeyUtc,
      },
      "No fastest growing 24h winner found"
    );

    return {
      status: "no_winner",
      postId: null,
      language: lang,
    };
  }

  const winnerPost = await prisma.blogPost.findFirst({
    where: { id: winnerPostId, language: lang },
    select: { id: true, authorId: true },
  });

  if (!winnerPost) {
    logger.warn(
      {
        event: "featured_compute_missing_post",
        featureType: FEATURED_POST.FASTEST_GROWING,
        language: lang,
        date: hourKeyUtc,
        winnerPostId,
      },
      "Fastest growing 24h winner post not found"
    );

    return {
      status: "missing_post",
      postId: null,
      language: lang,
    };
  }

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

    logger.info(
      {
        event: "featured_compute_created",
        featureType: FEATURED_POST.FASTEST_GROWING,
        language: lang,
        date: hourKeyUtc,
        postId: winnerPost.id,
        authorId: winnerPost.authorId,
        likeCount24h,
      },
      "Fastest growing 24h computed and badge awarded"
    );

    return {
      status: "created",
      postId: winnerPost.id,
      authorId: winnerPost.authorId,
      likeCount24h,
      language: lang,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      logger.warn(
        {
          event: "featured_compute_race_condition",
          featureType: FEATURED_POST.FASTEST_GROWING,
          language: lang,
          date: hourKeyUtc,
          postId: winnerPost.id,
        },
        "Fastest growing 24h already created by another concurrent process"
      );

      return {
        status: "duplicate_race",
        postId: winnerPost.id,
        language: lang,
      };
    }

    throw e;
  }
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
  computeDailyJoke,
  computeTopCreatorThisMonth,
  computeMostCommentedThisWeek,
  computeTrendingThisWeek,
  computeFastestGrowing24h,
  getCurrentFeatured,
};