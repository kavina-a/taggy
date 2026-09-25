-- NOTE (hand-edited, see 01-01/02-01/03/04/05 precedent): Prisma's diff
-- engine treats "Business_location_gist" and "business_name_trgm_idx" as
-- unmanaged drift (raw DDL, not @@index). Auto-generated DROP INDEX for
-- both, plus `ALTER COLUMN "searchable" DROP DEFAULT` on the generated
-- tsvector column, must not appear here.

-- AlterTable
ALTER TABLE "Business" ADD COLUMN "consumerAlert" TEXT;

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
