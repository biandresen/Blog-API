import prisma from "../config/prismaClient.js";
import { BADGE, FEATURED_POST } from "../constants.js";

async function getBadgeHistoryForUser(userId, { page = 1, limit = 15 }) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 15);
  const skip = (p - 1) * l;

  const [items, total] = await Promise.all([
    prisma.badgeAward.findMany({
      where: { userId },
      orderBy: { awardedAt: "desc" },
      skip,
      take: l,
    }),
    prisma.badgeAward.count({ where: { userId } }),
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

export async function awardJokeOfTheDayToAuthor({ authorId, postId, dayUtc }) {
  // dayUtc should be midnight UTC
  // Award history (BadgeAward): one per user per day
  // Current badge (CurrentUserBadge): ensure user has the badge currently (validTo optional)

  // 1) History record (idempotent by unique constraint you set: @@unique([userId, badge, validFrom]))
  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom: {
        userId: authorId,
        badge: BADGE.JOKE_OF_DAY,
        validFrom: dayUtc,
      },
    },
    update: {},
    create: {
      userId: authorId,
      badge: BADGE.JOKE_OF_DAY,
      validFrom: dayUtc,
      // validTo optional: dayUtc + 1 day, if you want
      context: { postId },
    },
  });

  // 2) Current badge (idempotent by @@unique([userId, badge]))
  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge: {
        userId: authorId,
        badge: BADGE.JOKE_OF_DAY,
      },
    },
    update: {
      since: dayUtc,
      context: { postId },
      validTo: null,
    },
    create: {
      userId: authorId,
      badge: BADGE.JOKE_OF_DAY,
      since: dayUtc,
      context: { postId },
      validTo: null,
    },
  });
}

// async function getBadgeHistoryForUser(userId, { page = 1, limit = 50 } = {}) {
//   const take = Math.min(Number(limit) || 50, 100);
//   const skip = (Number(page) - 1) * take;

//   const [items, count] = await Promise.all([
//     prisma.badgeAward.findMany({
//       where: { userId },
//       orderBy: [{ awardedAt: "desc" }],
//       skip,
//       take,

//     }),
//     prisma.badgeAward.count({ where: { userId } }),
//   ]);

//   return { items, count };
// }

export async function awardTopCreatorMonthToUser({ userId, monthStartUtc, monthEndUtc, postCount }) {
  // history: unique per user+badge+validFrom (your existing unique works)
  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom: {
        userId,
        badge: BADGE.TOP_CREATOR_MONTH,
        validFrom: monthStartUtc,
      },
    },
    update: {
      validTo: monthEndUtc,
      context: { postCount },
    },
    create: {
      userId,
      badge: BADGE.TOP_CREATOR_MONTH,
      validFrom: monthStartUtc,
      validTo: monthEndUtc,
      context: { postCount },
    },
  });

  // current: unique per user+badge (your existing unique works)
  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge: { userId, badge: BADGE.TOP_CREATOR_MONTH },
    },
    update: {
      since: monthStartUtc,
      validTo: monthEndUtc,
      context: { postCount },
    },
    create: {
      userId,
      badge: BADGE.TOP_CREATOR_MONTH,
      since: monthStartUtc,
      validTo: monthEndUtc,
      context: { postCount },
    },
  });
}

export async function awardMostCommentedWeekToAuthor({
  authorId,
  postId,
  weekStartUtc,
  weekEndUtc,
  commentCount,
}) {
  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom: {
        userId: authorId,
        badge: FEATURED_POST.MOST_COMMENTED_WEEK,
        validFrom: weekStartUtc,
      },
    },
    update: {
      validTo: weekEndUtc,
      context: { postId, commentCount },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.MOST_COMMENTED_WEEK,
      validFrom: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, commentCount },
    },
  });

  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge: {
        userId: authorId,
        badge: FEATURED_POST.MOST_COMMENTED_WEEK,
      },
    },
    update: {
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, commentCount },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.MOST_COMMENTED_WEEK,
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, commentCount },
    },
  });
}

export async function awardTrendingWeekToAuthor({
  authorId,
  postId,
  weekStartUtc,
  weekEndUtc,
  likeCount,
}) {
  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom: {
        userId: authorId,
        badge: FEATURED_POST.TRENDING_WEEK,
        validFrom: weekStartUtc,
      },
    },
    update: {
      validTo: weekEndUtc,
      context: { postId, likeCount },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.TRENDING_WEEK,
      validFrom: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, likeCount },
    },
  });

  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge: {
        userId: authorId,
        badge: FEATURED_POST.TRENDING_WEEK,
      },
    },
    update: {
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, likeCount },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.TRENDING_WEEK,
      since: weekStartUtc,
      validTo: weekEndUtc,
      context: { postId, likeCount },
    },
  });
}

export async function awardFastestGrowingToAuthor({
  authorId,
  postId,
  validFromUtc,
  validToUtc,
  likeCount24h,
}) {
  // History (idempotent by @@unique([userId, badge, validFrom]))
  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom: {
        userId: authorId,
        badge: FEATURED_POST.FASTEST_GROWING,
        validFrom: validFromUtc,
      },
    },
    update: {
      validTo: validToUtc,
      context: { postId, likeCount24h, windowHours: 24 },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.FASTEST_GROWING,
      validFrom: validFromUtc,
      validTo: validToUtc,
      context: { postId, likeCount24h, windowHours: 24 },
    },
  });

  // Current badge (idempotent by @@unique([userId, badge]))
  await prisma.currentUserBadge.upsert({
    where: {
      userId_badge: {
        userId: authorId,
        badge: FEATURED_POST.FASTEST_GROWING,
      },
    },
    update: {
      since: validFromUtc,
      validTo: validToUtc,
      context: { postId, likeCount24h, windowHours: 24 },
    },
    create: {
      userId: authorId,
      badge: FEATURED_POST.FASTEST_GROWING,
      since: validFromUtc,
      validTo: validToUtc,
      context: { postId, likeCount24h, windowHours: 24 },
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
