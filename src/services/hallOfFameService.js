import prisma from "../config/prismaClient.js";
import { startOfUtcMonth, addUtcMonths, startOfUtcWeek, addUtcDays } from "../utils/date.js";

const FEATURE_BADGES = [
  "TOP_CREATOR_MONTH",
  "JOKE_OF_DAY",
  "TRENDING_WEEK",
  "MOST_COMMENTED_WEEK",
  "FASTEST_GROWING",
];

const WEIGHTS = {
  TOP_CREATOR_MONTH: 5,
  JOKE_OF_DAY: 4,
  FASTEST_GROWING: 3,
  TRENDING_WEEK: 3,
  MOST_COMMENTED_WEEK: 2,
};

function getPeriodRange(period) {
  const now = new Date();

  if (period === "week") {
    const from = startOfUtcWeek(now);
    const to = addUtcDays(from, 7);
    return { from, to };
  }

  if (period === "month") {
    const from = startOfUtcMonth(now);
    const to = addUtcMonths(from, 1);
    return { from, to };
  }

  return { from: null, to: null }; // all-time
}

function sumWeights(winsByBadge) {
  let score = 0;
  for (const [badge, count] of Object.entries(winsByBadge)) {
    score += (WEIGHTS[badge] ?? 0) * (count ?? 0);
  }
  return score;
}

export async function getHallOfFameUsers({ period = "month", limit = 25 }) {
  const { from, to } = getPeriodRange(period);

  // 1) badge wins
  const winsRows = await prisma.badgeAward.groupBy({
    by: ["userId", "badge"],
    where: {
      badge: { in: FEATURE_BADGES },
      ...(from && to ? { awardedAt: { gte: from, lt: to } } : {}),
    },
    _count: { _all: true },
  });

  // map: userId -> {badge: count}
  const winsByUser = new Map();
  for (const r of winsRows) {
    const u = r.userId;
    if (!winsByUser.has(u)) winsByUser.set(u, {});
    winsByUser.get(u)[r.badge] = r._count._all;
  }

  // 2) likes received (group by postId, then map postId->authorId)
  const likeRows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: {
      ...(from && to ? { createdAt: { gte: from, lt: to } } : {}),
    },
    _count: { _all: true },
  });

  const likePostIds = likeRows.map((r) => r.postId);
  const likePosts = likePostIds.length
    ? await prisma.blogPost.findMany({
        where: { id: { in: likePostIds } },
        select: { id: true, authorId: true },
      })
    : [];

  const postIdToAuthor = new Map(likePosts.map((p) => [p.id, p.authorId]));
  const likesByUser = new Map();
  for (const r of likeRows) {
    const authorId = postIdToAuthor.get(r.postId);
    if (!authorId) continue;
    likesByUser.set(authorId, (likesByUser.get(authorId) ?? 0) + r._count._all);
  }

  // 3) comments received (same pattern)
  const commentRows = await prisma.comment.groupBy({
    by: ["postId"],
    where: {
      ...(from && to ? { createdAt: { gte: from, lt: to } } : {}),
    },
    _count: { _all: true },
  });

  const commentPostIds = commentRows.map((r) => r.postId);
  const commentPosts = commentPostIds.length
    ? await prisma.blogPost.findMany({
        where: { id: { in: commentPostIds } },
        select: { id: true, authorId: true },
      })
    : [];

  const cPostIdToAuthor = new Map(commentPosts.map((p) => [p.id, p.authorId]));
  const commentsByUser = new Map();
  for (const r of commentRows) {
    const authorId = cPostIdToAuthor.get(r.postId);
    if (!authorId) continue;
    commentsByUser.set(authorId, (commentsByUser.get(authorId) ?? 0) + r._count._all);
  }

  // 4) build user list from union of ids (or you can include more later)
  const userIds = new Set([
    ...winsByUser.keys(),
    ...likesByUser.keys(),
    ...commentsByUser.keys(),
  ]);

  if (userIds.size === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: {
      id: true,
      username: true,
      avatar: true,
      role: true,
      dailyJokeStreak: true,
      dailyJokeBestStreak: true,
      currentBadges: true,
    },
  });

  // 5) compose rows + sort
  const rows = users.map((u) => {
    const winsByBadge = winsByUser.get(u.id) ?? {};
    const winsTotal = Object.values(winsByBadge).reduce((a, b) => a + (b ?? 0), 0);

    const featuredScore = sumWeights(winsByBadge);

    return {
      user: u,
      winsByBadge,
      winsTotal,
      featuredScore,
      likesReceived: likesByUser.get(u.id) ?? 0,
      commentsReceived: commentsByUser.get(u.id) ?? 0,
      dailyStreak: u.dailyJokeStreak ?? 0,
      bestStreak: u.dailyJokeBestStreak ?? 0,
    };
  });

  rows.sort((a, b) => {
    if (b.featuredScore !== a.featuredScore) return b.featuredScore - a.featuredScore;
    if (b.winsTotal !== a.winsTotal) return b.winsTotal - a.winsTotal;
    if (b.likesReceived !== a.likesReceived) return b.likesReceived - a.likesReceived;
    if (b.dailyStreak !== a.dailyStreak) return b.dailyStreak - a.dailyStreak;
    return b.commentsReceived - a.commentsReceived;
  });

  return rows.slice(0, limit);
}

export default { getHallOfFameUsers };