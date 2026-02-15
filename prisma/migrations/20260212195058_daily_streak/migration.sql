-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyJokeStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastDailyJokeViewAt" TIMESTAMP(3);
