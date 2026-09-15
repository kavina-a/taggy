---
phase: 03-reviews-ratings
plan: ui
subsystem: web
tags: [react-hook-form, zod, radix-ui, nextjs-server-components, trust-and-safety, ranking]

# Dependency graph
requires:
  - phase: 03-reviews-ratings (backend chunk)
    provides: Review/ReviewPhoto Prisma models, MOD-01 hard-block classifier, REV-03/REV-06 review-filter engine, POST/PATCH/GET review API routes with response-shape secrecy enforcement (toAuthorReviewResponse)
provides:
  - StarRatingInput, ReviewComposer, ReviewCard, ReviewList, ReviewSortDropdown UI components (components/reviews/*)
  - lib/reviews/sort-reviews.ts — pure, tested blended/newest/highest/lowest review-list ordering (REV-05)
  - REV-04's "X reviews not currently recommended" disclosure, wired into the business page, never hidden/faked
  - Full write-review flow through the business page: guest login prompt -> composer (create/edit) -> outcome-blind confirmation -> reachable-either-way review, verified end-to-end via Playwright
affects: [Phase 4 (Voting, Owner Response & Reporting — VOTE-01/02 will replace sort-reviews.ts's neutral helpfulness placeholder), Phase 5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "sortReviews<T extends SortableReview>() is a generic pure function so callers (SSR page, client ReviewList) get their full item shape back out directly, never just a bare ranking-input subset requiring a manual reorder-by-id step"
    - "React Server Component page does its own direct Prisma queries for review data (never an internal fetch() to its own API route), matching this project's established app/business/[slug]/page.tsx convention"
    - "Client-side form validation mirrors the server's Zod schema exactly via zodResolver(updateReviewSchema) rather than re-declaring the rules, so the server stays the single source of truth"

key-files:
  created:
    - lib/reviews/sort-reviews.ts
    - lib/reviews/sort-reviews.test.ts
    - lib/types/review.ts
    - components/ui/textarea.tsx
    - components/reviews/star-rating-input.tsx
    - components/reviews/star-rating-input.test.tsx
    - components/reviews/review-card.tsx
    - components/reviews/review-card.test.tsx
    - components/reviews/review-sort-dropdown.tsx
    - components/reviews/review-sort-dropdown.test.tsx
    - components/reviews/review-composer.tsx
    - components/reviews/review-composer.test.tsx
    - components/reviews/review-list.tsx
    - components/reviews/review-list.test.tsx
    - e2e/write-review-flow.spec.ts
  modified:
    - app/api/businesses/[slug]/reviews/route.ts
    - components/business/business-page.tsx
    - components/business/business-page.test.tsx
    - app/business/[slug]/page.tsx
    - e2e/guest-browsing.spec.ts
    - e2e/search-and-auth-flow.spec.ts

key-decisions:
  - "Client-only composerFormSchema (a local .omit/.extend of updateReviewSchema) reshapes photos from string[] to {url:string}[] for react-hook-form's useFieldArray, which needs an object-per-row shape for stable field identity — flattened back to string[] immediately before the fetch payload is built, never a second source of truth for the actual validation rules"
  - "Review photos render via a plain <img>, not next/image — review photo URLs are arbitrary already-hosted strings the reviewer supplies (no upload infra this phase) and next.config.ts's images.remotePatterns is deliberately restricted to picsum.photos only (T-03-02); widening it to arbitrary user-supplied hostnames would be a real security regression"
  - "Extended GET /api/businesses/[slug]/reviews to expose userAccountCreatedAt/userReviewCount — needed as real inputs for REV-05's reviewer-credibility sort term; still never exposes filterReason/filterSignals, and visibilityStatus remains reader-safe-only (never echoed to the review's own author via POST/PATCH)"
  - "sortReviews()'s blended term uses a documented exponential recency decay (30-day half-life) + a log-scaled credibility score (account age capped at 1yr, review count capped ~10) + a HELPFULNESS_SCORE_NEUTRAL=0 placeholder that is weighted but zeroed, so VOTE-01/02 (Phase 4) only needs to replace that one constant with a real computed value, never re-tune the other weights"
  - "Made sortReviews<T extends SortableReview>() generic (not just SortableReview[] -> SortableReview[]) so both the SSR page and ReviewList's client re-sort get their full ReviewListItem objects back directly, eliminating a manual id-based reorder step at both call sites"
  - "ReviewComposer's existing-review starting state is collapsed behind an 'Edit your review' button rather than always showing a pre-filled open form; a review card's own 'Edit' link is a same-page anchor (#write-a-review) to that single composer instance rather than per-card inline editing state, since REV-01's one-review-per-user-per-business constraint means there is only ever one editable review per user per business"

requirements-completed: [REV-04, REV-05]

coverage:
  - id: D1
    description: "lib/reviews/sort-reviews.ts — pure sortReviews(reviews, option, now) implementing REV-05's blended default (recency + reviewer credibility + neutral helpfulness placeholder) and Newest/Highest/Lowest overrides"
    requirement: "REV-05"
    verification:
      - kind: unit
        ref: "lib/reviews/sort-reviews.test.ts (6 tests: newest/highest/lowest orderings incl. tiebreaks, blended outranking a raw-rating difference via credibility+recency, purity/no-mutation, default-now)"
        status: pass
    human_judgment: false
  - id: D2
    description: "ReviewComposer (REV-01/REV-02) — rating-first StarRatingInput, 50-char-minimum Textarea with live count, optional photo URLs, POST/PATCH wiring, outcome-blind generic success confirmation, 409-race handling via router.refresh()"
    requirement: "REV-01"
    verification:
      - kind: unit
        ref: "components/reviews/review-composer.test.tsx (5 tests), components/reviews/star-rating-input.test.tsx (5 tests)"
        status: pass
      - kind: e2e
        ref: "e2e/write-review-flow.spec.ts — full write + edit flow through real HTTP requests against the real DB"
        status: pass
    human_judgment: false
  - id: D3
    description: "ReviewList + ReviewCard (REV-04) — recommended-only default list, per-review Edit affordance gated on session user id, never-hidden 'X reviews not currently recommended' disclosure that lazily fetches ?includeFiltered=true and renders the filtered subset with a visually distinct (dashed/tinted) card variant"
    requirement: "REV-04"
    verification:
      - kind: unit
        ref: "components/reviews/review-list.test.tsx (4 tests), components/reviews/review-card.test.tsx (4 tests)"
        status: pass
      - kind: e2e
        ref: "e2e/write-review-flow.spec.ts — asserts the written review is reachable EITHER in the main list OR behind the disclosure link, never assuming a fixed filter outcome"
        status: pass
    human_judgment: false
  - id: D4
    description: "Business page wiring — app/business/[slug]/page.tsx fetches recommended reviews (with reviewer-credibility data), the real not_recommended count, and the current session user's own review, all via direct Prisma queries (no internal API fetch), then passes them into BusinessPageView's new (additive, defaulted) props"
    requirement: "REV-04"
    verification:
      - kind: unit
        ref: "components/business/business-page.test.tsx (+3 new tests: guest prompt, logged-in composer, Reviews section render; all 9 pre-existing tests still pass unmodified)"
        status: pass
      - kind: build
        ref: "npm run build and npx tsc --noEmit both pass"
        status: pass
    human_judgment: false

# Metrics
duration: 19min
completed: 2026-09-15
status: complete
---

# Phase 3 (UI chunk): Reviews & Ratings Summary

**Full write-review UI on the business page — star-rating composer with outcome-blind confirmation, a review list with a never-hidden "not currently recommended" disclosure, and a tested blended/newest/highest/lowest sort — closing out REV-04/REV-05 on top of the 03-backend chunk's API.**

## Performance

- **Duration:** ~19 min
- **Started:** 2026-09-15T15:08:08Z
- **Completed:** 2026-09-15T15:26:54Z
- **Tasks:** 17 commits (sort-reviews RED/GREEN, GET-route credibility fields, StarRatingInput RED/GREEN, ReviewCard RED/GREEN, ReviewSortDropdown RED/GREEN, ReviewComposer RED/GREEN, ReviewList RED/GREEN, business-page wiring RED/GREEN, page.tsx server-side fetch wiring, e2e spec + 2-file regression fix)
- **Files modified:** 21

## Accomplishments

- `lib/reviews/sort-reviews.ts` — a pure, generic, independently unit-tested REV-05 ranking function (exponential recency decay + log-scaled reviewer-credibility + a documented, weighted-but-zeroed helpfulness placeholder awaiting Phase 4's VOTE-01/02), reused identically server-side (SSR initial order) and client-side (sort-dropdown override)
- `StarRatingInput`, `ReviewComposer`, `ReviewCard`, `ReviewList`, `ReviewSortDropdown` — five new components under `components/reviews/`, each built TDD RED->GREEN, matching this codebase's established shadcn/Radix/react-hook-form conventions exactly (no new visual language)
- REV-03/spec 6.3's UI discipline enforced structurally: `ReviewComposer` only ever receives `AuthorReviewResponse`'s shape (never `visibilityStatus`) and shows one generic "Thanks for your review!" message regardless of outcome — verified both by unit test and by the e2e spec asserting the written review is reachable through *either* the main list or the disclosure link, never assuming a fixed filter outcome
- REV-04's "X reviews not currently recommended" disclosure — real count, omitted entirely at 0, lazily fetches `?includeFiltered=true`, renders the filtered subset with a visually distinct card variant
- Business page now does its own direct Prisma queries (matching the established Server Component pattern) for recommended reviews, the real not-recommended count, and the current user's own review — wired into `BusinessPageView` via additive, defaulted props so the pre-existing component contract kept passing unmodified
- Full Playwright coverage (`e2e/write-review-flow.spec.ts`): guest prompt -> phone-OTP login -> write -> outcome-blind confirmation -> located either-way -> edit -> re-verified, against the real dev DB and real API routes

## Task Commits

1. **RED: REV-05 sort tests** - `753655c` (test)
2. **GREEN: sort-reviews.ts** - `77594cf` (feat)
3. **Expose reviewer credibility in GET reviews route** - `31f1e67` (feat)
4. **RED: StarRatingInput tests + Textarea primitive** - `98b39a0` (test)
5. **GREEN: StarRatingInput** - `5479c68` (feat)
6. **RED: ReviewCard tests** - `9b06fe4` (test)
7. **GREEN: ReviewCard** - `824f7a8` (feat)
8. **RED: ReviewSortDropdown tests** - `518b374` (test)
9. **GREEN: ReviewSortDropdown** - `ae0ca9a` (feat)
10. **RED: ReviewComposer tests** - `690fe97` (test)
11. **GREEN: ReviewComposer** - `518dc50` (feat)
12. **RED: ReviewList tests** - `e70cf31` (test)
13. **GREEN: ReviewList** - `665dacd` (feat)
14. **RED: business-page wiring tests** - `330d6f5` (test)
15. **GREEN: wire composer/list into BusinessPageView** - `01bd6ed` (feat)
16. **Server-side review fetch wiring (page.tsx) + sortReviews generic cleanup** - `c6c4ca8` (feat)
17. **e2e write-review-flow + 2-file "Log in" locator regression fix** - `1bda9b6` (test)

**Plan metadata:** (this commit) - docs: complete 03-ui chunk

_TDD tasks committed as separate RED (`test(03): ...`) then GREEN (`feat(03): ...`) commits per this project's established convention (backend chunk, computeOpenNow, classifyReview)._

## Files Created/Modified

- `lib/reviews/sort-reviews.ts` / `.test.ts` - REV-05 pure ranking function
- `lib/types/review.ts` - shared `ReviewListItem` shape (ISO-string dates, matching the existing hoursOverrides convention)
- `components/ui/textarea.tsx` - small new shadcn-style primitive for the composer's text field
- `components/reviews/star-rating-input.tsx` / `.test.tsx` - controlled 1-5 radiogroup star picker
- `components/reviews/review-card.tsx` / `.test.tsx` - reviewer name (Anonymous fallback)/rating/date/text/photos/Edit affordance
- `components/reviews/review-sort-dropdown.tsx` / `.test.tsx` - REV-05's Recommended/Newest/Highest/Lowest override
- `components/reviews/review-composer.tsx` / `.test.tsx` - REV-01/REV-02 create+edit form
- `components/reviews/review-list.tsx` / `.test.tsx` - REV-04/REV-05 list + disclosure + sort wiring
- `app/api/businesses/[slug]/reviews/route.ts` - exposes `userAccountCreatedAt`/`userReviewCount` for REV-05
- `components/business/business-page.tsx` / `.test.tsx` - Write-a-Review + Reviews sections wired in
- `app/business/[slug]/page.tsx` - server-side review/credibility/own-review Prisma fetches
- `e2e/write-review-flow.spec.ts` - full write/edit flow e2e coverage
- `e2e/guest-browsing.spec.ts`, `e2e/search-and-auth-flow.spec.ts` - `exact: true` fix for the "Log in" locator collision (see Deviations)

## Decisions Made

See `key-decisions` in frontmatter — the composer's client-only photos-field reshaping, the plain-`<img>`-not-`next/image` call for review photos, exposing reviewer credibility data from the GET route, the sort-reviews blend/weight design, making `sortReviews` generic, and the single-composer-instance edit-affordance pattern are the load-bearing ones for future phases (especially Phase 4's VOTE-01/02, which slots into the existing `HELPFULNESS_WEIGHT` term).

## Deviations from Plan

Since this chunk was executed directly without an upstream PLAN.md, "deviations" below are judgment calls and auto-fixes made during direct implementation.

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extended GET /api/businesses/[slug]/reviews with reviewer-credibility fields**
- **Found during:** Implementing REV-05's blended sort
- **Issue:** REV-05 requires "reviewer credibility (account age / review-count proxy)" as a real ranking input, but the backend chunk's GET route only returned `userName` — no account age or review-count data existed anywhere the UI could reach.
- **Fix:** Added `user.createdAt` and `user._count.reviews` to the route's Prisma `include`/mapping as `userAccountCreatedAt`/`userReviewCount`. Still never exposes `filterReason`/`filterSignals`.
- **Files modified:** `app/api/businesses/[slug]/reviews/route.ts`
- **Verification:** `lib/reviews/sort-reviews.test.ts`'s blended-ordering test exercises these exact fields; `npx tsc --noEmit` and full build pass.
- **Committed in:** `31f1e67`

**2. [Rule 1 - Bug] Used a plain `<img>`, not `next/image`, for review photos**
- **Found during:** Building ReviewCard
- **Issue:** `next.config.ts`'s `images.remotePatterns` is deliberately restricted to `picsum.photos` only (T-03-02, an explicit security decision from Phase 1). Review photos are arbitrary already-hosted URLs a reviewer supplies (no upload infra this phase) — using `next/image` would either throw at request time for any non-whitelisted host or require widening the whitelist to arbitrary user-supplied hostnames, a real security regression.
- **Fix:** `ReviewCard` renders photos via a plain `<img loading="lazy">` instead, with a real (non-empty) `alt`.
- **Files modified:** `components/reviews/review-card.tsx`
- **Verification:** `components/reviews/review-card.test.tsx`'s photo test passes; no `next.config.ts` change was made.
- **Committed in:** `824f7a8`

**3. [Rule 1 - Bug] Fixed an e2e-test-only bug: `Date.now()` in review text tripped MOD-01's PII card-number guard**
- **Found during:** First e2e run of `write-review-flow.spec.ts`
- **Issue:** The test used `Date.now()` (a 13-digit number) as a uniqueness token appended to review text. `lib/moderation/classify-content.ts`'s `CARD_REGEX` correctly flags any 13-19 digit run as a card-like PII sequence — this is exactly the intended MOD-01 behavior, not an app bug, but it broke the test's own fixture.
- **Fix:** Switched the uniqueness token to `Date.now().toString(36)` (base36, mixed letters/digits, never a long pure-digit run).
- **Files modified:** `e2e/write-review-flow.spec.ts`
- **Verification:** Re-ran the spec; passes reliably across repeated runs.
- **Committed in:** `1bda9b6`

**4. [Rule 1 - Bug] Fixed a real regression in 2 pre-existing e2e specs caused by this chunk's new link**
- **Found during:** Running the full `npx playwright test` suite after adding the business page's guest prompt
- **Issue:** The new "Log in to write a review" link's accessible name contains "Log in" as a substring. Two Phase 2 specs (`e2e/guest-browsing.spec.ts`, `e2e/search-and-auth-flow.spec.ts`) located the header's CTA via `getByRole("link", { name: "Log in" })` without `exact: true` — Playwright's default substring name-matching made this locator ambiguous (strict-mode violation) on any page that also renders the new link.
- **Fix:** Added `exact: true` to every header "Log in" locator in both files.
- **Files modified:** `e2e/guest-browsing.spec.ts`, `e2e/search-and-auth-flow.spec.ts`
- **Verification:** Full `npx playwright test` run — all 4 specs pass, re-run twice to confirm no flakiness.
- **Committed in:** `1bda9b6`

---

**Total deviations:** 4 auto-fixed (1 missing-critical, 3 bug-prevention/regression-fix)
**Impact on plan:** All four were necessary for correctness against already-scoped requirements (REV-05's credibility input, T-02-03's security boundary, and two real regressions this chunk's own change caused in existing e2e coverage). No scope creep beyond REV-04/REV-05 plus the security/test-integrity fixes those directly required.

## Issues Encountered

- The same 2 pre-existing, unrelated time-of-day-flaky tests in `lib/search/run-search-query.test.ts` (documented in `.planning/phases/03-reviews-ratings/deferred-items.md` from the backend chunk) are still present and still not touched — full-suite `npx vitest run` shows 187 passed / 2 failed (189 total), an unchanged failure count from the backend chunk's own baseline.
- `npx playwright test` emitted a benign `[WebServer] Error: The destination stream closed early` log line on one run (webserver stdout noise, not a test failure) — did not reproduce on the following two runs and no test outcome was affected.

## User Setup Required

None — no external service configuration required. The dev Postgres container (`docker compose up -d`) was already running.

## Next Phase Readiness

**Ready for Phase 4 (Voting, Owner Response & Reporting):**
- `lib/reviews/sort-reviews.ts`'s `HELPFULNESS_WEIGHT`/`HELPFULNESS_SCORE_NEUTRAL` constants are the exact integration point for VOTE-01/02 — replacing the neutral placeholder with a real computed Useful/Funny/Cool score requires no re-tuning of the recency/credibility weights.
- `ReviewCard` has no vote-button UI yet (out of this chunk's scope per the phase objective) — Phase 4 adds that directly to the card.
- The review-photo upload gap noted by the backend chunk (`photos` is URL-string-only, no upload infra) is still open; Phase 5's PHOTO-01/PHOTO-02 is the first phase that plans to add real upload infrastructure, which would also let `ReviewCard`'s photo rendering move to `next/image` once uploaded photos live on a controlled domain.

**Blockers/concerns for the next phase:**
- None new. The route-handler-level automated-test-coverage gap the backend chunk flagged is now meaningfully narrowed by `e2e/write-review-flow.spec.ts`, which exercises POST/PATCH/GET through real HTTP requests end-to-end.

---
*Phase: 03-reviews-ratings*
*Completed: 2026-09-15*

## Self-Check: PASSED

All 15 created files confirmed present on disk; all 17 task commit hashes confirmed present in `git log`.
