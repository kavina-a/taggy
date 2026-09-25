-- NOTE (hand-edited, see 01-01/02-01/03/04 precedent): Prisma's diff
-- engine treats "Business_location_gist" and "business_name_trgm_idx" as
-- unmanaged drift (raw DDL, not @@index). Auto-generated DROP INDEX for
-- both, plus `ALTER COLUMN "searchable" DROP DEFAULT` on the generated
-- tsvector column, were removed — dropping either index would regress
-- geo-decay ranking / fuzzy-name search, and DROP DEFAULT on a GENERATED
-- ALWAYS column is rejected by Postgres.

-- AlterTable
ALTER TABLE "BusinessPhoto" ADD COLUMN     "uploadedByUserId" TEXT;

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerVote" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_businessId_createdAt_idx" ON "Question"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Answer_questionId_voteCount_idx" ON "Answer"("questionId", "voteCount");

-- CreateIndex
CREATE INDEX "AnswerVote_answerId_idx" ON "AnswerVote"("answerId");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerVote_answerId_userId_key" ON "AnswerVote"("answerId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE INDEX "CollectionItem_businessId_idx" ON "CollectionItem"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_collectionId_businessId_key" ON "CollectionItem"("collectionId", "businessId");

-- CreateIndex
CREATE INDEX "BusinessPhoto_uploadedByUserId_idx" ON "BusinessPhoto"("uploadedByUserId");

-- AddForeignKey
ALTER TABLE "BusinessPhoto" ADD CONSTRAINT "BusinessPhoto_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerVote" ADD CONSTRAINT "AnswerVote_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerVote" ADD CONSTRAINT "AnswerVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One default collection per user (COLL-01). Partial unique — Prisma schema
-- cannot express WHERE isDefault = true.
CREATE UNIQUE INDEX "Collection_user_default_uidx" ON "Collection" ("userId") WHERE "isDefault" = true;
