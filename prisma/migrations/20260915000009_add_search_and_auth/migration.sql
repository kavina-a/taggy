-- pg_trgm: fuzzy/typo-tolerant fallback matching on Business.name, used only
-- when the primary tsvector query returns zero rows (never blended into the
-- same ORDER BY as ts_rank_cd). Must be created before any statement below
-- that references trigram operators/opclasses.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
-- Hand-edited (per 02-RESEARCH.md Pattern 1 / 02-01-PLAN.md Task 2): Prisma's
-- own diff can only emit a plain, non-generated column add for an
-- Unsupported("tsvector")? field. Replaced with a real generated column so
-- Postgres keeps it transactionally consistent with name/description,
-- following the same Unsupported()-plus-hand-edited-DDL precedent Phase 1
-- established for the geography(Point,4326) column.
ALTER TABLE "Business" ADD COLUMN "searchable" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "languagePref" TEXT NOT NULL DEFAULT 'en',
    "hasSeenProfilePrompt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "OtpChallenge_phone_expiresAt_idx" ON "OtpChallenge"("phone", "expiresAt");

-- CreateIndex
CREATE INDEX "business_searchable_gin_idx" ON "Business" USING GIN ("searchable");

-- CreateIndex
-- Trigram fallback index for typo-tolerant Business.name matching (see
-- pg_trgm extension comment above).
CREATE INDEX "business_name_trgm_idx" ON "Business" USING GIN ("name" gin_trgm_ops);
