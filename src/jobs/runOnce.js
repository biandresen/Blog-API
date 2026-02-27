import * as featuredService from "../services/featuredService.js";

await featuredService.computeTopCreatorThisMonth();
await featuredService.computeTrendingThisWeek();
await featuredService.computeMostCommentedThisWeek();
await featuredService.computeFastestGrowing24h();

console.log("Done");
process.exit(0);