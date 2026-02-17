import prisma from "../config/prismaClient.js";

export async function awardJokeOfTheDayToAuthor({ authorId, postId, dayUtc }) {
  // dayUtc should be midnight UTC
  // Award history (BadgeAward): one per user per day
  // Current badge (CurrentUserBadge): ensure user has the badge currently (validTo optional)

  // 1) History record (idempotent by unique constraint you set: @@unique([userId, badge, validFrom]))
  await prisma.badgeAward.upsert({
    where: {
      userId_badge_validFrom: {
        userId: authorId,
        badge: "JOKE_OF_DAY",
        validFrom: dayUtc,
      },
    },
    update: {},
    create: {
      userId: authorId,
      badge: "JOKE_OF_DAY",
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
        badge: "JOKE_OF_DAY",
      },
    },
    update: {
      since: dayUtc,
      context: { postId },
      validTo: null,
    },
    create: {
      userId: authorId,
      badge: "JOKE_OF_DAY",
      since: dayUtc,
      context: { postId },
      validTo: null,
    },
  });
}

async function getBadgeHistoryForUser(userId, { page = 1, limit = 50 } = {}) {
  const take = Math.min(Number(limit) || 50, 100);
  const skip = (Number(page) - 1) * take;

  const [items, count] = await Promise.all([
    prisma.badgeAward.findMany({
      where: { userId },
      orderBy: [{ awardedAt: "desc" }],
      skip,
      take,
      select: {
        id: true,
        badge: true,
        awardedAt: true,
        validFrom: true,
        validTo: true,
        context: true,
      },
    }),
    prisma.badgeAward.count({ where: { userId } }),
  ]);

  return { items, count };
}

export default {
  awardJokeOfTheDayToAuthor,
  getBadgeHistoryForUser,
};
