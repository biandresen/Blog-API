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

export function startOfUtcMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

export function addUtcMonths(d, months) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1, 0, 0, 0, 0));
}

export function startOfUtcWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7;   // make Monday start (Mon=0)
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
}

export function addUtcDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function startOfUtcHour(d = new Date()) {
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    0, 0, 0
  ));
}

export function addUtcHours(d, hours) {
  return new Date(d.getTime() + hours * 60 * 60 * 1000);
}