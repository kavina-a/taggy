---
phase: 05-rich-content-photos-qa-collections
plan: implementation
subsystem: full-stack
tags: [prisma, nextjs-route-handlers, iron-session, uploads, trust-and-safety]

requires:
  - phase: 04-voting-owner-response-reporting
    provides: Business claim, report-on-photo, classifyContent, business page shell
provides:
  - PHOTO-01 community photo upload to a business page
  - PHOTO-02 basic NSFW/irrelevance/geometry/caption moderation before a photo goes live
  - QA-01 questions, answers, upvote toggle, top-voted first
  - COLL-01 default My Saved Places + named lists
  - COLL-02 public shareable collection URLs
affects: []

tech-stack:
  added: []
  patterns:
    - "Uploads land in public/uploads as same-origin /uploads/{id}.ext — next.config images.remotePatterns stays picsum-only (T-03-02)"
    - "classifyPhoto is a hard block like classifyContent: invalid/too small/extreme aspect/NSFW lexical/promotional caption never become a BusinessPhoto row"
    - "One default collection per user via a partial unique index (WHERE isDefault = true); named lists are extra Collection rows"

key-files:
  created:
    - prisma/migrations/20260916000017_add_photos_qa_collections/migration.sql
    - lib/moderation/classify-photo.ts
    - lib/moderation/make-png.ts
    - lib/uploads/store-photo.ts
    - lib/qa/sort-answers.ts
    - lib/qa/load-questions.ts
    - lib/collections/ensure-default.ts
    - app/api/businesses/[slug]/photos/route.ts
    - app/api/businesses/[slug]/questions/route.ts
    - app/api/questions/[id]/answers/route.ts
    - app/api/answers/[id]/votes/route.ts
    - app/api/collections/route.ts
    - app/api/collections/[id]/route.ts
    - app/api/collections/[id]/items/route.ts
    - app/api/collections/[id]/items/[businessId]/route.ts
    - app/saved/page.tsx
    - app/collections/[slug]/page.tsx
    - components/photos/photo-upload-form.tsx
    - components/qa/question-list.tsx
    - components/collections/save-business-button.tsx
    - components/collections/collection-card.tsx
    - e2e/photos-qa-collections.spec.ts
  modified:
    - prisma/schema.prisma
    - components/business/business-page.tsx
    - app/business/[slug]/page.tsx
    - app/layout.tsx
---

# Phase 5 — Photos, Q&A & Collections

Executed directly from ROADMAP.md + REQUIREMENTS.md (no PLAN/CONTEXT/RESEARCH/UI-SPEC),
matching the 2026-09-15 instruction used for Phases 3–4. This is the last Consumer MVP
phase.

## What shipped

**PHOTO-01/02.** Any logged-in user can upload a JPEG/PNG/WebP to a business page
(`POST /api/businesses/[slug]/photos`). Files are stored under `public/uploads/` and
served as same-origin `/uploads/…`, so `next/image` works without widening
`images.remotePatterns`. `classifyPhoto` runs **before** the `BusinessPhoto` row exists:
magic-byte format, 5MB cap, min 200px edge, max 4:1 aspect (banner/spam), NSFW lexical
check on caption/filename, MOD-01 `classifyContent` on caption, promotional-caption
block. Seed/picsum gallery photos are unchanged. User uploads cannot be marked as menu
photos.

**QA-01.** Logged-in users ask (`POST …/questions`) and answer (`POST /api/questions/[id]/answers`);
guests get login CTAs. Answers are an upvote toggle (`AnswerVote` unique on answer+user,
no self-vote). `sortAnswers` puts highest `voteCount` first, then earlier `createdAt`.
Claimed-owner answers show an "Owner" label. Question/answer text runs through
`classifyContent`.

**COLL-01/02.** First save creates `My Saved Places` (`isDefault`). Named lists via the
save dialog. `/saved` lists the user's collections; **Make public** exposes
`/collections/[slug]` as a shareable page (private lists 404 for everyone except the
owner). Header **Saved** link for logged-in users.

## Decisions

- Local disk + `public/uploads`, not S3/object storage — bootstrap budget; swap the
  `storePhotoBytes` body later without changing the API.
- Do not widen `next.config.ts` `images.remotePatterns` — same-origin uploads don't need it.
- NSFW/irrelevance is rule-based (file validity + geometry + caption), not a paid vision
  model. Honest "basic automated" gate, not a stub that always returns ok.
- Review composer remains URL-string photos (REV-01 optional photos). PHOTO-01 is
  community photos on the business gallery, not a rewrite of review attachments.
- Prisma migrate `--create-only` then strip gist/trgm DROP INDEX and searchable
  DROP DEFAULT (fifth occurrence of the unmanaged-index trap). Added a partial unique
  index `Collection_user_default_uidx` in the SQL for one default list per user.

## Gates

- `npx tsc --noEmit` clean
- `npm run build` clean (Next.js 16.3.5)
- `npx vitest run` — 217 passed
- `npx playwright test` — 6/6 passed, including `e2e/photos-qa-collections.spec.ts`
