---
phase: 04-voting-owner-response-reporting
plan: implementation
subsystem: full-stack
tags: [prisma, nextjs-route-handlers, iron-session, trust-and-safety, ranking]

requires:
  - phase: 03-reviews-ratings
    provides: Review model, business page review list, sort-reviews.ts helpfulness placeholder, phone-OTP auth
provides:
  - VOTE-01 independent Useful/Funny/Cool toggles + real helpfulness term in blended sort
  - CLAIM-01 phone-OTP claim of existing listings and OTP-gated create-new-listing
  - VOTE-02 one public "Response from the owner" per review
  - MOD-02 report/flag on review, photo, or business with confirmation-only response
affects: [Phase 5 (photos/Q&A/collections — report already covers photos; Q&A votes can reuse ReviewVote patterns)]

tech-stack:
  added: []
  patterns:
    - "OtpChallenge.purpose namespaces login vs claim so proving control of a listing number cannot sign you in as that number"
    - "Reporter-facing API uses a hard-coded allowlist serializer (toReporterConfirmation) identical in spirit to toAuthorReviewResponse"
    - "sortReviews helpfulness is a log-scaled Useful-weighted score; Funny/Cool count at 0.5 — no re-tune of recency/credibility weights"

key-files:
  created:
    - prisma/migrations/20260915172052_add_voting_claim_reporting/migration.sql
    - lib/otp/purpose.ts
    - lib/businesses/seed-phone.ts
    - lib/businesses/slugify.ts
    - lib/reports/reporter-response.ts
    - lib/reviews/to-review-list-item.ts
    - lib/reviews/load-viewer-votes.ts
    - lib/validation/vote.schema.ts
    - lib/validation/claim.schema.ts
    - lib/validation/owner-response.schema.ts
    - lib/validation/report.schema.ts
    - lib/validation/create-listing.schema.ts
    - app/api/reviews/[id]/votes/route.ts
    - app/api/reviews/[id]/owner-response/route.ts
    - app/api/businesses/[slug]/claim/send/route.ts
    - app/api/businesses/[slug]/claim/verify/route.ts
    - app/api/listings/route.ts
    - app/api/listings/otp/route.ts
    - app/api/reports/route.ts
    - app/businesses/new/page.tsx
    - components/reviews/vote-buttons.tsx
    - components/reviews/owner-response.tsx
    - components/reports/report-button.tsx
    - components/business/claim-listing-card.tsx
    - components/business/create-listing-form.tsx
    - e2e/vote-claim-report.spec.ts
  modified:
    - prisma/schema.prisma
    - prisma/seed.ts
    - lib/otp/verify.ts
    - lib/reviews/sort-reviews.ts
    - lib/types/review.ts
    - lib/types/business.ts
    - app/business/[slug]/page.tsx
    - components/reviews/review-card.tsx
    - components/reviews/review-list.tsx
    - components/business/business-page.tsx
    - components/business/photo-gallery.tsx
    - app/layout.tsx
    - app/api/auth/otp/send/route.ts
---

# Phase 4 — Voting, Owner Response & Reporting

Executed directly from ROADMAP.md + REQUIREMENTS.md (no PLAN/CONTEXT/RESEARCH/UI-SPEC),
matching the 2026-09-15 instruction used for Phase 3.

## What shipped

**VOTE-01.** `ReviewVote` is unique on `(reviewId, userId, kind)` so Useful, Funny, and
Cool are independent toggles. POST `/api/reviews/[id]/votes` flips one kind and
transactionally updates denormalized `usefulCount`/`funnyCount`/`coolCount`. Anyone
logged in can vote; authors cannot vote on their own review; guests see the buttons as
login links. `sort-reviews.ts` replaced `HELPFULNESS_SCORE_NEUTRAL` with
`computeHelpfulnessScore` (Useful = 1.0, Funny/Cool = 0.5, log-scaled, capped at 1.0)
without retuning recency/credibility weights.

**CLAIM-01.** Every seeded business now has a deterministic listed E.164 number
(`seedPhoneForSlug`) so claim has something to OTP. Claiming an existing listing:
logged-in user → OTP sent to **the business's listed number** with
`OtpChallenge.purpose = "claim"` (never `"login"`) → verify → `claimedByUserId`.
Creating a new listing (`/businesses/new`) is OTP-to-entered-phone then
create+claim in one transaction. No Business Registration upload.

**VOTE-02.** `OwnerResponse.reviewId` is unique. Only the claimed owner can POST/PATCH.
UI label is the required string "Response from the owner". MOD-01 text classifier
runs on the body.

**MOD-02.** POST `/api/reports` accepts review / photo / business + a reason picker.
Response is `{ ok: true }` from `toReporterConfirmation()` — no id, status, or
outcome. Duplicate reports upsert silently so a reporter cannot probe whether a
prior report "worked".

## Decisions

- Vote auth = any logged-in account, not "logged-in-with-history". Self-votes 403.
- Claim OTP is a separate purpose on the existing `OtpChallenge` table rather than a
  second table — login OTPs cannot satisfy claim, and vice versa.
- Seed phones are computed in `seed.ts`, not added to the 107-row JSON, so
  `businessSeedSchema` stays `.strict()` without a 107-file rewrite.
- Helpfulness weights Useful above Funny/Cool; log-scale matches credibility so a
  viral review cannot fully drown recency.
- Create-new-listing requires OTP **before** the row exists (spam-resistant) rather
  than create-unclaimed-then-claim.
- Prisma migrate `--create-only` then hand-edit: removed `DROP INDEX` on
  `Business_location_gist` / `business_name_trgm_idx` and `ALTER COLUMN searchable
  DROP DEFAULT`. Applied with `migrate deploy` to avoid the interactive drift prompt.

## Gates

- `npx tsc --noEmit` clean
- `npm run build` clean (Next.js 16.3.5)
- `npx vitest run` — 199 passed, 2 failed (pre-existing open-now fixture flakiness
  in `run-search-query.test.ts`, documented in Phase 3 deferred-items.md)
- `npx playwright test` — 5/5 passed, including `e2e/vote-claim-report.spec.ts`
