export function toClientUser(user) {
  return {
    id: String(user.id),
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    termsAcceptedAt: user.termsAcceptedAt,
    termsVersion: user.termsVersion,
    dailyJokeStreak: user.dailyJokeStreak,
    dailyJokeBestStreak: user.dailyJokeBestStreak,
    dailyJokeLastViewedAt: user.dailyJokeLastViewedAt,
  };
}
