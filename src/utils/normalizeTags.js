/**
 * Normalizes tags from input: trims and converts to lowercase.
 *
 * @param {string|string[]} tagInput - Comma-separated string or array of tags.
 * @returns {string[]} Array of normalized tags.
 */

function normalizeTags(tagInput) {
  return Array.isArray(tagInput) ?
      tagInput.map((t) => t.trim().toLowerCase())
    : tagInput.split(",").map((t) => t.trim().toLowerCase());
}

export default normalizeTags;
