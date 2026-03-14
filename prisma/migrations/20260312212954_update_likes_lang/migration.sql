/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId,language]` on the table `PostLike` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PostLike_postId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_language_key" ON "PostLike"("postId", "userId", "language");
