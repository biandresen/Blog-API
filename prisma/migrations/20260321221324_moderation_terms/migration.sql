/*
  Warnings:

  - You are about to drop the column `language` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `PostLike` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId,userId]` on the table `PostLike` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BlogPost_language_published_idx";

-- DropIndex
DROP INDEX "Comment_language_createdAt_idx";

-- DropIndex
DROP INDEX "Comment_language_createdAt_postId_idx";

-- DropIndex
DROP INDEX "PostLike_language_createdAt_idx";

-- DropIndex
DROP INDEX "PostLike_postId_userId_language_key";

-- DropIndex
DROP INDEX "Tag_language_name_idx";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "language";

-- AlterTable
ALTER TABLE "PostLike" DROP COLUMN "language";

-- CreateTable
CREATE TABLE "ModerationTerm" (
    "id" SERIAL NOT NULL,
    "term" TEXT NOT NULL,
    "category" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationTerm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModerationTerm_term_key" ON "ModerationTerm"("term");

-- CreateIndex
CREATE INDEX "ModerationTerm_isActive_idx" ON "ModerationTerm"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ResetPasswordToken_userId_idx" ON "ResetPasswordToken"("userId");

-- CreateIndex
CREATE INDEX "ResetPasswordToken_expiresAt_idx" ON "ResetPasswordToken"("expiresAt");
