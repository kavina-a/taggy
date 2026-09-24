---
phase: 04-voting-owner-response-reporting
verified: 2026-09-15T17:45:00Z
status: passed
score: 4/4 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 4 Verification — Voting, Owner Response & Reporting

**Date:** 2026-09-15
**Method:** Goal-backward against ROADMAP.md success criteria, reading live source
(not the SUMMARY). Requirements: VOTE-01, VOTE-02, CLAIM-01, MOD-02.

## Goal

Users can react to reviews, verified business owners can respond publicly, and anyone
can report bad content — without payments or dashboards.

## Success criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | On the business page, any user can independently toggle Useful, Funny, and Cool on a review | ✓ VERIFIED | `components/reviews/vote-buttons.tsx` — three independent buttons with `aria-pressed`; `ReviewVote @@unique([reviewId, userId, kind])` in `prisma/schema.prisma`; POST `app/api/reviews/[id]/votes/route.ts` toggles one kind without clearing others. Guests get `/login` links (AUTH-02: write actions require login). New accounts can vote — no review-history check. Self-vote returns 403. `lib/reviews/sort-reviews.ts` `computeHelpfulnessScore` is wired into the blended sort (useful=1, funny/cool=0.5, log-capped). |
| 2 | A business owner can claim an unclaimed listing (or create a new one) via phone-OTP verification to the listed number | ✓ VERIFIED | Existing: `app/api/businesses/[slug]/claim/send/route.ts` sends OTP to `business.phone` with `OTP_PURPOSE_CLAIM`; verify in `claim/verify/route.ts` uses `verifyOtpChallenge(..., "claim")` then sets `claimedByUserId`. Create: `app/businesses/new/page.tsx` + `POST /api/listings` verifies claim OTP then creates the row already claimed. `lib/otp/verify.ts` scopes lookup by `purpose` so a claim OTP cannot log you in. Seeded listings get `seedPhoneForSlug` in `prisma/seed.ts`. No BR-document upload anywhere. |
| 3 | Once claimed, the verified owner can post exactly one public "Response from the owner" reply beneath a review | ✓ VERIFIED | `OwnerResponse.reviewId @unique`; POST/PATCH `app/api/reviews/[id]/owner-response/route.ts` 403s unless `business.claimedByUserId === session.userId`, 409 on a second create. UI: `OwnerResponseBlock` heading is the literal string "Response from the owner"; composer shown only when `isOwner` (`components/reviews/review-card.tsx`). |
| 4 | Any user can one-tap report/flag a review, photo, or business from its page, picking a reason, and receives only a submission confirmation with no visibility into the outcome | ✓ VERIFIED | `ReportButton` on review cards, review photos, gallery photos, and the business page (`targetType` review/photo/business). Reason picker: spam/offensive/misleading/not_relevant/other. `toReporterConfirmation()` returns `{ ok: true }` only — `status` exists on the `Report` row for a future moderator console and is never serialized. Upsert on `(userId, targetType, targetId)` so a duplicate submit still looks like a fresh confirmation. Guests are sent to `/login`. |

## Requirement checkboxes

- VOTE-01 — met
- VOTE-02 — met
- CLAIM-01 — met (minimal owner-response claim + create; BIZ-01 document verification still v2)
- MOD-02 — met

## Gaps / accepted deviations

None against the four success criteria. Photo *content* moderation remains Phase 5
(Phase 3's accepted MOD-01 photo deviation is unchanged — reports can flag a photo
URL, but there is still no upload/NSFW pipeline).

## Gates

- `npx tsc --noEmit` — pass
- `npm run build` — pass
- `npx vitest run` — 199/201 (2 known pre-existing flaky search tests)
- `npx playwright test` — 5/5
