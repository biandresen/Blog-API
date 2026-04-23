import prisma from "./prismaClient.js";

async function resetDB() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "BadgeAward",
      "CurrentUserBadge",
      "FeaturedPost",
      "User",
      "BlogPost",
      "Comment",
      "Tag",
      "PostLike",
      "RefreshToken",
      "ResetPasswordToken",
      "EmailVerificationToken",
      "ModerationEvent",
      "AuditLog",
      "ProductEvent"
    RESTART IDENTITY CASCADE;
  `);

  console.log("Database reset complete.");
}

resetDB()
  .catch((err) => {
    console.error("Failed to reset database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
