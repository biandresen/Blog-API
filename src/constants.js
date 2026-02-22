export const ROLES = {
  USER_ROLE: "USER",
  ADMIN_ROLE: "ADMIN",
};

export const CORS_ORIGINS = [
  "https://bloggy-app.dev",
  "http://localhost:5173",
  "http://localhost:5174",
];

export const MAX_CHARS = {
  TITLE: 64,
  BODY: 10000,
  TAGS: 200,
  COMMENT: 3000,
  SEARCH: 100
}

export const LEGAL_VERSIONS = {
  TERMS: "1.0",
  PRIVACY: "1.0",
  COOKIES: "1.0",
  RULES: "1.0",
};

export const INCLUDED_IN_USER = Object.freeze({
  id: true,
  username: true,
  role: true,
  avatar: true,
  dailyJokeStreak: true,
  dailyJokeBestStreak: true,
  currentBadges: {
    select: { id: true, badge: true, since: true, validTo: true, context: true },
  },
});

export const BADGE = Object.freeze({
  JOKE_OF_DAY: "JOKE_OF_DAY",
  TOP_CREATOR_MONTH: "TOP_CREATOR_MONTH",
  // later:
  TRENDING_WEEK: "TRENDING_WEEK",
  MOST_COMMENTED: "MOST_COMMENTED",
  FASTEST_GROWING: "FASTEST_GROWING",
});

export const FEATURED_POST = Object.freeze({
  DAILY: "DAILY_JOKE",
  TOP_CREATOR_MONTH: "TOP_CREATOR_MONTH",
  // later:
  TRENDING_WEEK: "TRENDING_WEEK",
  MOST_COMMENTED_WEEK: "MOST_COMMENTED_WEEK",
  FASTEST_GROWING: "FASTEST_GROWING",
});
