export function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function isSameUtcDay(a, b) {
  return startOfUtcDay(a).getTime() === startOfUtcDay(b).getTime();
}

export function isYesterdayUtc(last, now) {
  const lastDay = startOfUtcDay(last).getTime();
  const today = startOfUtcDay(now).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  return lastDay === today - oneDay;
}
