---
phase: 05-rich-content-photos-qa-collections
verified: 2026-09-16T00:30:00Z
status: passed
score: 4/4 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 5 Verification — Photos, Q&A & Collections

**Date:** 2026-09-16
**Method:** Goal-backward against ROADMAP.md success criteria, reading live source
(not the SUMMARY). Requirements: PHOTO-01, PHOTO-02, QA-01, COLL-01, COLL-02.

## Goal

Business pages become richer through community contributions — photos beyond reviews,
questions and answers, and shareable saved lists — rounding out the Consumer MVP.

## Success criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Any logged-in user (not just reviewers) can upload a photo to a business page | ✓ VERIFIED | `PhotoUploadForm` on the business page; guests get "Log in to add a photo". POST `app/api/businesses/[slug]/photos/route.ts` requires a session, stores bytes via `storePhotoBytes`, creates `BusinessPhoto` with `uploadedByUserId`. No review-history check. `isMenuPhoto` is forced false. |
| 2 | Uploaded photos pass basic automated moderation (NSFW/irrelevance) before appearing live | ✓ VERIFIED | `classifyPhoto` in `lib/moderation/classify-photo.ts` runs **before** insert. Blocked photos return 422 and never create a row. Checks: jpeg/png/webp magic bytes, 5MB max, min 200px edge, max 4:1 aspect (`irrelevant_geometry`), NSFW terms on caption/filename, `classifyContent` on caption (closes Phase 3's MOD-01 photo-caption gap for community uploads), promotional caption (`irrelevant_caption`). Unit tests in `classify-photo.test.ts`. |
| 3 | Any user can post a question, any user (including the owner) can answer, answers are votable, top-voted surfaces first | ✓ VERIFIED | Ask/answer APIs + `QuestionList`. AUTH-02: write requires login; guests read and see login CTAs. Owner answers labeled "Owner" when `userId === claimedByUserId`. `POST /api/answers/[id]/votes` toggles an upvote; self-vote 403. `sortAnswers` is voteCount desc, then createdAt asc. `loadQuestionsForBusiness` applies that sort server-side. |
| 4 | A logged-in user can save a business to default "My Saved Places" or a named list, and can make any collection public with a shareable link | ✓ VERIFIED | `SaveBusinessButton` dialog: default list from `ensureDefaultCollection` (name is the literal "My Saved Places"), "Create and save" for named lists. `/saved` Make public → `/collections/[slug]`. Private collections `notFound()` for non-owners. Header **Saved** link. |

## Requirement checkboxes

- PHOTO-01 — met
- PHOTO-02 — met
- QA-01 — met
- COLL-01 — met
- COLL-02 — met

## Gaps / accepted deviations

- Review composer still accepts already-uploaded URL strings (Phase 3 REV-01), not the new file picker. PHOTO-01's success criterion is community photos on the business page, which is what shipped.
- `next.config.ts` `images.remotePatterns` remains `picsum.photos` only. Uploaded files are same-origin `/uploads/…` and do not need a remote pattern. Review-card third-party URLs still use `<img>`.
- No paid NSFW vision model — PHOTO-02 is file/geometry/caption rules. Documented as the bootstrap-budget "basic" gate, not a stub.
- PROJECT.md Active still lists "people also viewed" and a Consumer Alert banner slot — those are not Phase 5 ROADMAP success criteria and were not built.

## Gates

- `npx tsc --noEmit` — pass
- `npm run build` — pass
- `npx vitest run` — 217/217
- `npx playwright test` — 6/6
