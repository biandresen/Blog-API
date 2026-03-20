const BLOCKED_TERMS = [
  "idiot",
  "dum",
  "stupid",
];

function normalize(input) {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildWordRegex(term) {
  return new RegExp(`(^|\\s)${term}(\\s|$)`, "i");
}

export function findBlockedTerms(input) {
  const normalized = normalize(input);
  return BLOCKED_TERMS.filter((term) => buildWordRegex(term).test(normalized));
}

export function containsBlockedTerms(input) {
  return findBlockedTerms(input).length > 0;
}

export function moderateFields(
  fields,
) {
  const result = {};

  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;

    const matches = findBlockedTerms(value);

    if (matches.length > 0) {
      result[key] = matches;
    }
  }

  return {
    blocked: Object.keys(result).length > 0,
    matches: result,
  };
}