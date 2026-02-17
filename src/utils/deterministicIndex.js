// Deterministic index from a Date key + count.
// Same inputs => same output.
export function deterministicIndex(dateKey, count) {
  if (!count || count <= 0) return 0;

  // Use YYYY-MM-DD (UTC) as stable key
  const key = dateKey.toISOString().slice(0, 10);

  // Simple stable hash (djb2-like)
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) + key.charCodeAt(i); // hash * 33 + c
    hash |= 0; // keep 32-bit
  }

  return Math.abs(hash) % count;
}
