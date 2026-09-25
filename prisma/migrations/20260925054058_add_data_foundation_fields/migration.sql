-- NOTE (hand-edited, sixth occurrence — see 01-01/02-01/03/04/05 precedent):
-- Prisma's diff engine treats "Business_location_gist" and
-- "business_name_trgm_idx" as unmanaged drift (raw DDL, not @@index).
-- Auto-generated DROP INDEX for both, plus `ALTER COLUMN "searchable" DROP
-- DEFAULT` on the generated tsvector column, were removed — dropping either
-- index would regress geo-decay ranking / fuzzy-name search, and DROP
-- DEFAULT on a GENERATED ALWAYS column is rejected by Postgres.

-- CreateEnum
CREATE TYPE "PhotoTag" AS ENUM ('food', 'inside', 'outside', 'menu', 'drink', 'video');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "guaranteed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseRate" DOUBLE PRECISION,
ADD COLUMN     "responseTimeMinutes" INTEGER;

-- AlterTable
ALTER TABLE "BusinessPhoto" ADD COLUMN     "tag" "PhotoTag";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ReviewPhoto" ADD COLUMN     "tag" "PhotoTag";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "eliteYear" INTEGER,
ADD COLUMN     "friendCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photoCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;
