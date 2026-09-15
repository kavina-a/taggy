-- CreateEnum
CREATE TYPE "ReviewVisibilityStatus" AS ENUM ('recommended', 'not_recommended');

-- NOTE (hand-edited, see 02-01/03-backend precedent): Prisma's diff engine
-- treats "Business_location_gist" (Phase 1's hand-written GiST spatial
-- index) and "business_name_trgm_idx" (Phase 2's hand-written trigram
-- index) as unmanaged drift because both were created via raw DDL in prior
-- migrations, not via a `@@index` in schema.prisma (Prisma can't express a
-- GIST/trgm-opclass index declaratively for an Unsupported() column). The
-- auto-generated DROP INDEX statements for both were removed from this
-- migration — dropping either would silently regress SRCH-03's distance
-- filter, SRCH-05's geo-decay ranking, and the fuzzy-name search fallback.
-- Likewise, the auto-generated `ALTER COLUMN "searchable" DROP DEFAULT` was
-- removed: "searchable" is a `GENERATED ALWAYS AS (...) STORED` column
-- (add_search_and_auth migration), not a column with a real DEFAULT, and
-- Postgres rejects ALTER COLUMN ... DROP DEFAULT on a generated column.

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "avgRating" DOUBLE PRECISION,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3),
    "visibilityStatus" "ReviewVisibilityStatus" NOT NULL,
    "filterReason" TEXT,
    "filterSignals" JSONB NOT NULL DEFAULT '{}',
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewPhoto" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_businessId_visibilityStatus_idx" ON "Review"("businessId", "visibilityStatus");

-- CreateIndex
CREATE INDEX "Review_userId_createdAt_idx" ON "Review"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_businessId_key" ON "Review"("userId", "businessId");

-- CreateIndex
CREATE INDEX "ReviewPhoto_reviewId_idx" ON "ReviewPhoto"("reviewId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewPhoto" ADD CONSTRAINT "ReviewPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
