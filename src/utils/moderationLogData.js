export function getModerationLogData(moderation) {
  const matches = Array.isArray(moderation?.matches) ? moderation.matches : [];

  return {
    matchedTerms: matches
      .map((m) => m?.term)
      .filter(Boolean),

    matchedVariants: matches
      .map((m) => m?.matched)
      .filter(Boolean),
  };
}