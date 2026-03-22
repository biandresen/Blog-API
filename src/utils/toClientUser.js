export function toClientUser(user) {
  const client = {
    id: String(user.id),
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    active: user.active,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    termsAcceptedAt: user.termsAcceptedAt,
    termsVersion: user.termsVersion,
    preferredLanguage: user.preferredLanguage,
    dailyJokeStreak: user.dailyJokeStreak,
    dailyJokeBestStreak: user.dailyJokeBestStreak,
    dailyJokeLastViewedAt: user.dailyJokeLastViewedAt,
  };

  if (Array.isArray(user.currentBadges)) {
    client.currentBadges = user.currentBadges.map((b) => ({
      id: b.id,
      badge: b.badge,
      since: b.since,
      validTo: b.validTo,
      context: b.context,
      language: b.language,
    }));
  }

  return client;
}