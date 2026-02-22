-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FeatureType" ADD VALUE 'TOP_CREATOR_MONTH';
ALTER TYPE "FeatureType" ADD VALUE 'TRENDING_WEEK';
ALTER TYPE "FeatureType" ADD VALUE 'MOST_COMMENTED';
ALTER TYPE "FeatureType" ADD VALUE 'FASTEST_GROWING';
