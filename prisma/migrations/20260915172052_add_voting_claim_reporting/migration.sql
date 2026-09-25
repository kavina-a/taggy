-- CreateEnum
CREATE TYPE "VoteKind" AS ENUM ('useful', 'funny', 'cool');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('review', 'photo', 'business');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('spam', 'offensive', 'misleading', 'not_relevant', 'other');

-- NOTE (hand-edited, see 01-01/02-01/03-backend precedent): Prisma's diff
-- engine treats "Business_location_gist" and "business_name_trgm_idx" as
-- unmanaged drift (raw DDL, not @@index). Auto-generated DROP INDEX for
-- both, plus `ALTER COLUMN "searchable" DROP DEFAULT` on the generated
-- tsvector column, were removed — dropping either index would regress
-- geo-decay ranking / fuzzy-name search, and DROP DEFAULT on a GENERATED
-- ALWAYS column is rejected by Postgres.
--
-- OtpChallenge_phone_expiresAt_idx IS dropped below: it is Prisma-managed
-- and replaced by the purpose-aware (phone, purpose, expiresAt) index.

-- DropIndex
DROP INDEX "OtpChallenge_phone_expiresAt_idx";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "claimedByUserId" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "OtpChallenge" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'login';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "coolCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "funnyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usefulCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ReviewVote" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "VoteKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerResponse" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "OwnerResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewVote_reviewId_kind_idx" ON "ReviewVote"("reviewId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewVote_reviewId_userId_kind_key" ON "ReviewVote"("reviewId", "userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "OwnerResponse_reviewId_key" ON "OwnerResponse"("reviewId");

-- CreateIndex
CREATE INDEX "OwnerResponse_businessId_idx" ON "OwnerResponse"("businessId");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_userId_targetType_targetId_key" ON "Report"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "Business_phone_idx" ON "Business"("phone");

-- CreateIndex
CREATE INDEX "Business_claimedByUserId_idx" ON "Business"("claimedByUserId");

-- CreateIndex
CREATE INDEX "OtpChallenge_phone_purpose_expiresAt_idx" ON "OtpChallenge"("phone", "purpose", "expiresAt");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVote" ADD CONSTRAINT "ReviewVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVote" ADD CONSTRAINT "ReviewVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerResponse" ADD CONSTRAINT "OwnerResponse_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerResponse" ADD CONSTRAINT "OwnerResponse_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerResponse" ADD CONSTRAINT "OwnerResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
