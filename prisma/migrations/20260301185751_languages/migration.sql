/*
  Warnings:

  - A unique constraint covering the columns `[type,date,language]` on the table `FeaturedPost` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[language,name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('NO', 'EN');

-- DropIndex
DROP INDEX "FeaturedPost_date_idx";

-- DropIndex
DROP INDEX "FeaturedPost_type_date_key";

-- DropIndex
DROP INDEX "Tag_name_key";

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'NO';

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'NO';

-- AlterTable
ALTER TABLE "FeaturedPost" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'NO';

-- AlterTable
ALTER TABLE "PostLike" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'NO';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'NO';

-- CreateIndex
CREATE INDEX "BlogPost_language_published_createdAt_idx" ON "BlogPost"("language", "published", "createdAt");

-- CreateIndex
CREATE INDEX "BlogPost_language_published_updatedAt_idx" ON "BlogPost"("language", "published", "updatedAt");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_language_createdAt_idx" ON "BlogPost"("authorId", "language", "createdAt");

-- CreateIndex
CREATE INDEX "BlogPost_language_published_idx" ON "BlogPost"("language", "published");

-- CreateIndex
CREATE INDEX "Comment_language_createdAt_idx" ON "Comment"("language", "createdAt");

-- CreateIndex
CREATE INDEX "FeaturedPost_language_type_date_idx" ON "FeaturedPost"("language", "type", "date");

-- CreateIndex
CREATE INDEX "FeaturedPost_language_date_idx" ON "FeaturedPost"("language", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedPost_type_date_language_key" ON "FeaturedPost"("type", "date", "language");

-- CreateIndex
CREATE INDEX "PostLike_language_createdAt_idx" ON "PostLike"("language", "createdAt");

-- CreateIndex
CREATE INDEX "Tag_language_name_idx" ON "Tag"("language", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_language_name_key" ON "Tag"("language", "name");
