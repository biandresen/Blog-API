import prisma from "../config/prismaClient.js";
import { BADGE, FEATURED_POST } from "../constants.js";
import { normalizeLanguage } from "../utils/language.js";

async function getBadgeHistoryForUser(userId, { language, page = 1, limit = 15 } = {}) {
  const lang = normalizeLanguage(language);

  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 15);
  const skip = (p - 1) * l;

  const where = { userId, language: lang };

  const [items, total] = await Promise.all([
    prisma.badgeAward.findMany({
      where,
      orderBy: { awardedAt: "desc" },
      skip,
      take: l,
    }),
    prisma.badgeAward.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / l));

  return {
    items,
    total,
    meta: {
      page: p,
      limit: l,
      total,
      totalPages,
      hasPrev: p > 1,
      hasNext: p < totalPages,
    },
  };
}

export async function awardJokeOfTheDayToAuthor({ authorId, postId, dayUtc, language }) {
  const lang = normalizeLanguage(language);

  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom_language: {
        userId: authorId,
        badge: BADGE.JOKE_OF_DAY,
        validFrom: dayUtc,
        language: lang,
      },
    },
    update: {},
    create: {
      userId: authorId,
      badge: BADGE.JOKE_OF_DAY,
      validFrom: dayUtc,
      language: lang,
      context: { postId, language: lang },
    },
  });

  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge_language: {
        userId: authorId,
        badge: BADGE.JOKE_OF_DAY,
        language: lang,
      },
    },
    update: {
      since: dayUtc,
      context: { postId, language: lang },
      validTo: null,
    },
    create: {
      userId: authorId,
      badge: BADGE.JOKE_OF_DAY,
      language: lang,
      since: dayUtc,
      context: { postId, language: lang },
      validTo: null,
    },
  });
}

export async function awardTopCreatorMonthToUser({
  userId,
  monthStartUtc,
  monthEndUtc,
  postCount,
  context,
  language,
}) {
  const lang = normalizeLanguage(language);

  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom_language: {
        userId,
        badge: BADGE.TOP_CREATOR_MONTH,
        validFrom: monthStartUtc,
        language: lang,
      },
    },
    update: {
      validTo: monthEndUtc,
      context: { postCount, ...(context || {}), language: lang },
    },
    create: {
      userId,
      badge: BADGE.TOP_CREATOR_MONTH,
      validFrom: monthStartUtc,
      validTo: monthEndUtc,
      language: lang,
      context: { postCount, ...(context || {}), language: lang },
    },
  });

  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge_language: { userId, badge: BADGE.TOP_CREATOR_MONTH, language: lang },
    },
    update: {
      since: monthStartUtc,
      validTo: monthEndUtc,
      context: { postCount, ...(context || {}), language: lang },
    },
    create: {
      userId,
      badge: BADGE.TOP_CREATOR_MONTH,
      language: lang,
      since: monthStartUtc,
      validTo: monthEndUtc,
      context: { postCount, ...(context || {}), language: lang },
    },
  });
}

export async function awardMostCommentedWeekToAuthor({
  authorId,
  postId,
  weekStartUtc,
  weekEndUtc,
  commentCount,
  language,
}) {
  const lang = normalizeLanguage(language);

  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom_language: {
        userId: authorId,
        badge: FEATURED_POST.MOST_COMMENTED_WEEK,
        validFrom: weekStartUtc,
        language: lang,
      },
    },
    update: {
      validTo: weekEndUtc,
      context: { postId, commentCount, language: lang },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.MOST_COMMENTED_WEEK,
      validFrom: weekStartUtc,
      validTo: weekEndUtc,
      language: lang,
      context: { postId, commentCount, language: lang },
    },
  });

  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge_language: {
        userId: authorId,
        badge: FEATURED_POST.MOST_COMMENTED_WEEK,
        language: lang,
      },
    },
    update: {
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, commentCount, language: lang },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.MOST_COMMENTED_WEEK,
      language: lang,
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, commentCount, language: lang },
    },
  });
}

export async function awardTrendingWeekToAuthor({
  authorId,
  postId,
  weekStartUtc,
  weekEndUtc,
  likeCount,
  language,
}) {
  const lang = normalizeLanguage(language);

  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom_language: {
        userId: authorId,
        badge: FEATURED_POST.TRENDING_WEEK,
        validFrom: weekStartUtc,
        language: lang,
      },
    },
    update: {
      validTo: weekEndUtc,
      context: { postId, likeCount, language: lang },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.TRENDING_WEEK,
      validFrom: weekStartUtc,
      validTo: weekEndUtc,
      language: lang,
      context: { postId, likeCount, language: lang },
    },
  });

  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge_language: {
        userId: authorId,
        badge: FEATURED_POST.TRENDING_WEEK,
        language: lang,
      },
    },
    update: {
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, likeCount, language: lang },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.TRENDING_WEEK,
      language: lang,
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, likeCount, language: lang },
    },
  });
}

export async function awardFastestGrowingToAuthor({
  authorId,
  postId,
  validFromUtc,
  validToUtc,
  likeCount24h,
  language,
}) {
  const lang = normalizeLanguage(language);

  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom_language: {
        userId: authorId,
        badge: FEATURED_POST.FASTEST_GROWING,
        validFrom: validFromUtc,
        language: lang,
      },
    },
    update: {
      validTo: validToUtc,
      context: { postId, likeCount24h, windowHours: 24, language: lang },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.FASTEST_GROWING,
      validFrom: validFromUtc,
      validTo: validToUtc,
      language: lang,
      context: { postId, likeCount24h, windowHours: 24, language: lang },
    },
  });

  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge_language: {
        userId: authorId,
        badge: FEATURED_POST.FASTEST_GROWING,
        language: lang,
      },
    },
    update: {
      since: validFromUtc,
      validTo: validToUtc,
      context: { postId, likeCount24h, windowHours: 24, language: lang },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.FASTEST_GROWING,
      language: lang,
      since: validFromUtc,
      validTo: validToUtc,
      context: { postId, likeCount24h, windowHours: 24, language: lang },
    },
  });
}

export default {
  getBadgeHistoryForUser,
  awardJokeOfTheDayToAuthor,
  awardTopCreatorMonthToUser,
  awardMostCommentedWeekToAuthor,
  awardTrendingWeekToAuthor,
  awardFastestGrowingToAuthor,
};