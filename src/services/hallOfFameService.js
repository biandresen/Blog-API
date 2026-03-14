import prisma from "../config/prismaClient.js";
import { startOfUtcMonth, addUtcMonths, startOfUtcWeek, addUtcDays } from "../utils/date.js";
import { normalizeLanguage } from "../utils/language.js";

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

export async function getHallOfFameUsers({ language, period = "month", limit = 25 } = {}) {
  const lang = normalizeLanguage(language);
  const { from, to } = getPeriodRange(period);

  const timeFilter = from && to ? { gte: from, lt: to } : null;

  /**
   * 1) Badge wins (language-scoped)
   * Recommended: BadgeAward has `language` column.
   * If not, you can still filter by JSON context, but that's weaker.
   */
  const winsRows = await prisma.badgeAward.groupBy({
    by: ["userId", "badge"],
    where: {
      badge: { in: FEATURE_BADGES },
      ...(timeFilter ? { awardedAt: timeFilter } : {}),
      // If BadgeAward.language exists:
      language: lang,
      // If you did NOT add BadgeAward.language, you'd need:
      // context: { path: ["language"], equals: lang },  // Postgres JSON path filter
    },
    _count: { _all: true },
  });

  const winsByUser = new Map();
  for (const r of winsRows) {
    const u = r.userId;
    if (!winsByUser.has(u)) winsByUser.set(u, {});
    winsByUser.get(u)[r.badge] = r._count._all;
  }

  /**
   * 2) Likes received (language-scoped)
   * Best: PostLike has `language` OR filter through `post.language`.
   */
  const likeRows = await prisma.postLike.groupBy({
    by: ["postId"],
    where: {
      ...(timeFilter ? { createdAt: timeFilter } : {}),
      post: { language: lang }, // works even if PostLike has no language field
      // If PostLike.language exists you can also add:
      // language: lang,
    },
    _count: { _all: true },
  });

  const likePostIds = likeRows.map((r) => r.postId);
  const likePosts = likePostIds.length
    ? await prisma.blogPost.findMany({
        where: { id: { in: likePostIds }, language: lang },
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

  /**
   * 3) Comments received (language-scoped)
   * Best: Comment has `language` OR filter through `post.language`.
   */
  const commentRows = await prisma.comment.groupBy({
    by: ["postId"],
    where: {
      ...(timeFilter ? { createdAt: timeFilter } : {}),
      post: { language: lang }, // works even if Comment has no language field
      // If Comment.language exists:
      // language: lang,
    },
    _count: { _all: true },
  });

  const commentPostIds = commentRows.map((r) => r.postId);
  const commentPosts = commentPostIds.length
    ? await prisma.blogPost.findMany({
        where: { id: { in: commentPostIds }, language: lang },
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

  /**
   * 4) Union of users in this language slice
   */
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

      // NOTE: these are global in your schema.
      // If you make streaks per language later, change selection accordingly.
      dailyJokeStreak: true,
      dailyJokeBestStreak: true,

      // If you add language to CurrentUserBadge, filter it in code or query
      currentBadges: true,
    },
  });

  /**
   * 5) Compose + sort
   */
  const rows = users.map((u) => {
    const winsByBadge = winsByUser.get(u.id) ?? {};
    const winsTotal = Object.values(winsByBadge).reduce((a, b) => a + (b ?? 0), 0);
    const featuredScore = sumWeights(winsByBadge);

    return {
      user: u,
      language: lang,
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