/*
  Warnings:

  - You are about to drop the column `lastDailyJokeViewAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastDailyJokeViewAt",
ADD COLUMN     "dailyJokeBestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dailyJokeLastViewedAt" TIMESTAMP(3);
