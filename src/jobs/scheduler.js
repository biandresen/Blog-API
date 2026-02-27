import cron from "node-cron";
import * as featuredService from "../services/featuredService.js";

const TZ = "UTC";

// Run once on boot (optional, helps if the server was down during schedule)
async function runOnceOnBoot() {
  try {
    await featuredService.computeDailyJoke?.(); // if you have it as compute
    await featuredService.computeTrendingThisWeek();
    await featuredService.computeMostCommentedThisWeek();
    await featuredService.computeFastestGrowing24h();
    // Top creator: daily (or only on the 1st if you choose immutable)
    await featuredService.computeTopCreatorThisMonth();
  } catch (e) {
    console.error("[scheduler] boot run failed:", e);
  }
}

// Schedules
export function startScheduler() {
  console.log(`[scheduler] starting (TZ=${TZ})`);

  // Daily joke at 00:05 UTC
  cron.schedule("5 0 * * *", () => featuredService.computeDailyJoke(), { timezone: TZ });

  // Fastest growing every hour
  cron.schedule("0 * * * *", () => featuredService.computeFastestGrowing24h(), { timezone: TZ });

  // Trending week every hour
  cron.schedule("0 * * * *", () => featuredService.computeTrendingThisWeek(), { timezone: TZ });

  // Most commented week every hour
  cron.schedule("0 * * * *", () => featuredService.computeMostCommentedThisWeek(), { timezone: TZ });

  // Top creator once per day (or use "0 0 1 * *" for only on the 1st)
  cron.schedule("10 0 * * *", () => featuredService.computeTopCreatorThisMonth(), { timezone: TZ });

  runOnceOnBoot();
}