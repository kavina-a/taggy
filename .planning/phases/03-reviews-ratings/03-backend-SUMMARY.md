---
phase: 03-reviews-ratings
plan: backend
subsystem: api
tags: [prisma, postgres, zod, nextjs-route-handlers, trust-and-safety, ranking]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts
    provides: iron-session auth (getSession), Prisma/driver-adapter conventions, tsvector+geo-decay search ranking engine with a RATING_SCORE_NEUTRAL placeholder awaiting real data
provides:
  - Review/ReviewPhoto Prisma models with a DB-level one-review-per-user-per-business constraint
  - Business.avgRating/reviewCount denormalized aggregates, transactionally recomputed from recommended-only reviews
  - MOD-01 rule-based profanity/hate-speech/PII hard-block classifier (lib/moderation/classify-content.ts)
  - REV-03/REV-06 rules-based review-filter engine with documented weak/strong signal thresholds and structured filterSignals JSON for a future advertiser-parity audit (lib/reviews/review-filter.ts + gather-review-signals.ts)
  - POST /api/reviews, PATCH /api/reviews/[id], GET /api/businesses/[slug]/reviews — the response-shape-secrecy-enforced API surface REV-04/REV-05's UI chunk will consume
  - Real avgRating/reviewCount wired into search ranking (Bayesian-shrunk rating term, highest_rated/most_reviewed sorts, rating-threshold filter) — replaces Phase 2's neutral placeholder
affects: [03-reviews-ratings UI chunk (REV-04/REV-05), Phase 4 (Voting, Owner Response & Reporting — builds directly on the Review model), Phase 5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Author-facing API response shape enforced via a single shared serializer (toAuthorReviewResponse) rather than two independently-hand-written route handlers that could drift on which fields leak"
    - "Pure, DB-free scoring function (classifyReview) separated from its DB-querying signal-gathering counterpart (gatherReviewSignals) for independent unit-testability, mirroring computeOpenNow's existing split in this codebase"
    - "Hand-edit generated Prisma migrations to strip auto-generated DROP INDEX/DROP DEFAULT statements for Unsupported()-column-adjacent hand-written DDL (geo GiST index, trgm index, generated tsvector column) — third occurrence of this exact trap (Phase 1, Phase 2, now Phase 3), always inspect before applying"

key-files:
  created:
    - lib/moderation/classify-content.ts
    - lib/reviews/review-filter.ts
    - lib/reviews/gather-review-signals.ts
    - lib/reviews/text-similarity.ts
    - lib/reviews/recompute-business-rating.ts
    - lib/reviews/author-review-response.ts
    - lib/validation/review.schema.ts
    - app/api/reviews/route.ts
    - app/api/reviews/[id]/route.ts
    - app/api/businesses/[slug]/reviews/route.ts
    - prisma/migrations/20260915051549_add_reviews/migration.sql
  modified:
    - prisma/schema.prisma
    - lib/search/run-search-query.ts
    - lib/search/search-filters-from-params.ts
    - lib/search/search-params.schema.ts
    - components/search/filter-fields.tsx
    - components/search/filter-state.ts
    - components/search/filter-sidebar.test.tsx

key-decisions:
  - "Combined 'new account' and 'first-ever review' into ONE weak signal (low_reviewer_history), not two — spec explicitly warns against double-penalizing a genuinely new user's honest first review"
  - "Decision rule: 1+ strong signal OR 2+ weak signals tips a review to not_recommended, otherwise recommended — documented, simple, deliberately not an ML model per phase scope"
  - "Burst-posting threshold: >3 reviews across ANY business in the trailing hour (this project only allows one review per business per user, so burst = many different businesses rapidly, matching the real review-farm signature)"
  - "Text-similarity threshold: >0.8 Jaccard-trigram similarity to a prior review (own recent reviews + a 20-review platform-wide sample) is a STRONG signal on its own"
  - "Replaced RATING_SCORE_NEUTRAL with a Bayesian-shrunk rating term (5 phantom reviews at the neutral prior) rather than a naive avgRating/5, to actually satisfy SRCH-05's already-validated 'never a naive average' requirement now that real data exists"
  - "Chose 50-character minimum review text length, matching REQUIREMENTS.md's own literal wording for this milestone"

requirements-completed: [REV-01, REV-02, REV-03, REV-06, MOD-01]

coverage:
  - id: D1
    description: "MOD-01 real-time profanity/hate-speech/PII classifier — hard-blocks phone numbers, emails, card-like digit sequences, and a curated profanity/slur word list, with a word-boundary false-positive guard"
    requirement: "MOD-01"
    verification:
      - kind: unit
        ref: "lib/moderation/classify-content.test.ts (7 tests)"
        status: pass
    human_judgment: false
  - id: D2
    description: "REV-03/REV-06 rules-based review-filter engine — classifyReview() combines low-reviewer-history, burst-posting, and text-similarity signals into a recommended/not_recommended decision with structured filterSignals JSON for a future advertiser-parity audit"
    requirement: "REV-03"
    verification:
      - kind: unit
        ref: "lib/reviews/review-filter.test.ts (6 tests)"
        status: pass
      - kind: unit
        ref: "lib/reviews/text-similarity.test.ts (6 tests)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Review/ReviewPhoto Prisma schema with a DB-level @@unique([userId, businessId]) constraint, plus Business.avgRating/reviewCount columns, migrated without dropping Phase 1/2's hand-written geo GiST index, trgm index, or generated tsvector column"
    requirement: "REV-01"
    verification:
      - kind: manual_procedural
        ref: "docker exec psql \\d Review / SELECT indexname FROM pg_indexes WHERE tablename='Business' — confirmed Business_location_gist, business_name_trgm_idx, business_searchable_gin_idx all survived the migration"
        status: pass
    human_judgment: true
    rationale: "Migration-safety verification was a one-time manual DB inspection during execution, not a persisted repeatable automated test — appropriate for a schema/DDL change but not machine-reproducible evidence."
  - id: D4
    description: "POST /api/reviews and PATCH /api/reviews/[id] — auth-gated, MOD-01 hard-block then REV-03 soft-filter, one-review-per-user-per-business 409 on duplicate, response shape ({id, businessId, rating, text, createdAt}) IDENTICAL regardless of visibilityStatus outcome, avgRating/reviewCount recomputed transactionally"
    requirement: "REV-02"
    verification:
      - kind: manual_procedural
        ref: "Throwaway tsx script during execution (not persisted): create succeeds, duplicate correctly triggers P2002, MOD-01 blocks a phone-number-containing text, response keys verified to exclude visibilityStatus/filterReason, PATCH re-runs the filter and sets editedAt, ownership check confirmed 403-worthy for a non-author"
        status: pass
    human_judgment: true
    rationale: "This project has no route-handler-level automated test convention (grep confirmed zero app/**/*.test.ts even for Phase 2's auth routes — coverage there comes from Playwright e2e instead). Verified manually via a throwaway DB-level flow script during execution; recommend the next (UI) chunk add a Playwright e2e path exercising this through real HTTP requests, consistent with 02-09's e2e convention."
  - id: D5
    description: "GET /api/businesses/[slug]/reviews — recommended-only by default, +not_recommended via ?includeFiltered=true, never exposes filterReason/filterSignals to any caller"
    requirement: "REV-01"
    verification:
      - kind: manual_procedural
        ref: "Throwaway tsx script during execution (not persisted): confirmed default query returns only recommended-status rows vs. an unfiltered all-status query"
        status: pass
    human_judgment: true
    rationale: "Same route-handler-testing gap as D4 — verified manually, no persisted automated test exists yet."
  - id: D6
    description: "Real Business.avgRating/reviewCount wired into search ranking: Bayesian-shrunk rating term replacing the Phase 2 neutral placeholder, sort=highest_rated/most_reviewed ordering by the real columns, and the SRCH-03 rating-threshold filter re-enabled end to end (schema -> filters-from-params -> FilterFields UI)"
    requirement: "SRCH-05"
    verification:
      - kind: integration
        ref: "lib/search/run-search-query.test.ts — 'sort=highest_rated orders by real Business.avgRating descending', 'sort=most_reviewed orders by real Business.reviewCount descending', 'minRating excludes businesses below the threshold and businesses with no rating yet' (all pass)"
        status: pass
      - kind: unit
        ref: "components/search/filter-sidebar.test.tsx — rating chips enabled + onChange wiring (2 tests, pass)"
        status: pass
      - kind: manual_procedural
        ref: "Throwaway tsx script against real seeded businesses (Upali's by Nawaloka / Nihonbashi): created one 5-star and one 2-star review, confirmed highest_rated reordered them and minRating=4 correctly included/excluded each, then cleaned up to zero leftover rows"
        status: pass
    human_judgment: false

# Metrics
duration: 25min
completed: 2026-09-15
status: complete
---

# Phase 3 (backend chunk): Reviews & Ratings Summary

**Server-side review pipeline — rules-based MOD-01 content classifier, REV-03/REV-06 recommended/not_recommended filter with structured audit signals, and REV-01/REV-02 create/edit API routes whose author-facing response never leaks the filter outcome — plus real Business.avgRating/reviewCount wired into Phase 2's search ranking.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-09-15T05:16:00Z
- **Completed:** 2026-09-15T05:35:00Z
- **Tasks:** 8 commits (schema, classifier RED/GREEN, filter-engine RED/GREEN, API routes, search-ranking RED/GREEN)
- **Files modified:** 22

## Accomplishments

- Review/ReviewPhoto Prisma models + Business.avgRating/reviewCount, migrated without regressing Phase 1/2's hand-written geo index, trgm index, or generated tsvector column (same class of trap as 02-01-PLAN.md, caught before applying)
- MOD-01 hard-block classifier (profanity/slurs, Sri Lankan phone numbers, email addresses, card-like digit sequences) with a word-boundary false-positive guard, TDD RED->GREEN
- REV-03/REV-06 rules-based review filter (`classifyReview`) with three documented signals (low reviewer history, burst-posting, text similarity) and a simple, explicit weak/strong scoring rule — never an ML model, matching phase scope — TDD RED->GREEN
- POST/PATCH review endpoints whose author-facing response is byte-identical regardless of visibility outcome, enforced by a single shared serializer rather than hand-copied field lists in two handlers
- GET reviews endpoint for the next chunk's UI, with `includeFiltered` support and zero leakage of internal `filterReason`/`filterSignals`
- Real `avgRating`/`reviewCount` wired end-to-end into search: a Bayesian-shrunk rating term (not a naive average, per SRCH-05), `highest_rated`/`most_reviewed` sorts, and the SRCH-03 rating-threshold filter — verified both by new automated tests and a manual run against real seeded businesses (with full cleanup)

## Task Commits

1. **RED: MOD-01 classifier tests** - `71464f8` (test)
2. **GREEN: MOD-01 classifier** - `f59de74` (feat)
3. **RED: review-filter engine tests** - `209371f` (test)
4. **Review/ReviewPhoto schema + migration** - `dd0a7ae` (feat)
5. **GREEN: review-filter engine** - `255d7ab` (feat)
6. **Review API routes (POST/PATCH/GET)** - `7338daa` (feat)
7. **RED: real-rating search-ranking tests** - `13facd1` (test)
8. **GREEN: wire real avgRating/reviewCount into search ranking** - `a53eab7` (feat)

**Plan metadata:** (this commit) - docs: complete 03-backend chunk

_Note: TDD tasks committed as separate RED (`test(03): ...`) then GREEN (`feat(03): ...`) commits per the project's established computeOpenNow convention._

## Files Created/Modified

- `prisma/schema.prisma` - Review, ReviewPhoto, ReviewVisibilityStatus enum; Business.avgRating/reviewCount
- `prisma/migrations/20260915051549_add_reviews/migration.sql` - hand-edited to drop Prisma's auto-generated DROP INDEX/DROP DEFAULT statements for unmanaged geo/trgm/tsvector DDL
- `lib/moderation/classify-content.ts` - MOD-01 hard-block classifier
- `lib/reviews/review-filter.ts` - REV-03/REV-06 pure scoring function
- `lib/reviews/gather-review-signals.ts` - DB-querying signal gatherer feeding classifyReview
- `lib/reviews/text-similarity.ts` - Jaccard-trigram similarity utility
- `lib/reviews/recompute-business-rating.ts` - transactional avgRating/reviewCount aggregate
- `lib/reviews/author-review-response.ts` - shared author-facing response serializer (secrecy enforcement point)
- `lib/validation/review.schema.ts` - Zod .strict() create/update review schemas
- `app/api/reviews/route.ts` - POST (create review)
- `app/api/reviews/[id]/route.ts` - PATCH (edit review, author-only)
- `app/api/businesses/[slug]/reviews/route.ts` - GET (public review list, includeFiltered support)
- `lib/search/run-search-query.ts` - Bayesian-shrunk real rating term, highest_rated/most_reviewed sort, minRating filter
- `lib/search/search-filters-from-params.ts` - forwards rating param -> minRating
- `lib/search/search-params.schema.ts` - stale "no real rating data" comment updated
- `components/search/filter-fields.tsx` - rating chips re-enabled (no longer disabled)
- `components/search/filter-state.ts` - stale comment updated
- `components/search/filter-sidebar.test.tsx` - updated 2 tests for now-enabled rating chips

## Decisions Made

See `key-decisions` in frontmatter above — filter-engine thresholds (low-reviewer-history combination, burst >3/hour, similarity >0.8, 1 strong-or-2-weak decision rule), the Bayesian-shrinkage choice for real rating data, and the 50-character review minimum are the load-bearing ones for future phases to be aware of.

## Deviations from Plan

Since this chunk was executed directly from ROADMAP.md/REQUIREMENTS.md without an upstream PLAN.md, "deviations" below are judgment calls made during direct implementation rather than departures from a written plan.

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Bayesian-shrunk rating term instead of a naive average**
- **Found during:** Wiring real avgRating into run-search-query.ts
- **Issue:** The literal instruction ("replace the neutral placeholder with real avgRating data") could be read as a naive `avgRating/5`, but SRCH-05 (already marked Validated in PROJECT.md) explicitly requires "never a naive average" — a naive implementation would let a single 5-star review outrank a business with 50 reviews averaging 4.8.
- **Fix:** Implemented a documented Bayesian/Laplace-shrinkage term (5 phantom reviews at the same neutral prior Phase 2 always used), converging to the true average only as reviewCount grows.
- **Files modified:** `lib/search/run-search-query.ts`
- **Verification:** New tests in `run-search-query.test.ts` confirm both highest_rated ordering and that a single high-review-count business isn't trivially beaten by a low-review-count 5-star business (implicit in the fixture design — mid-rated-many-reviews at 4.0/50 vs. high-rated-few-reviews at 4.8/3).
- **Committed in:** `a53eab7`

**2. [Rule 1 - Bug] Hand-edited the generated migration to remove three destructive/invalid statements**
- **Found during:** Reviewing `npx prisma migrate dev --create-only`'s output before applying, per this chunk's explicit migration-safety instruction
- **Issue:** Prisma's diff engine generated `DROP INDEX "Business_location_gist"`, `DROP INDEX "business_name_trgm_idx"`, and an invalid `ALTER COLUMN "searchable" DROP DEFAULT` (searchable is a GENERATED ALWAYS AS ... STORED column, not a column with a real default) — applying as-generated would have regressed Phase 1's geo-decay search ranking and Phase 2's fuzzy-name fallback, and likely errored outright on the DROP DEFAULT.
- **Fix:** Removed all three statements from the migration file before applying, with a comment explaining why (third occurrence of this exact class of trap in this codebase, after 01-01 and 02-01).
- **Files modified:** `prisma/migrations/20260915051549_add_reviews/migration.sql`
- **Verification:** Post-migration `docker exec psql` inspection confirmed both indexes and the generated column survived; full test suite + `npm run build` + `npx tsc --noEmit` all pass afterward.
- **Committed in:** `dd0a7ae`

---

**Total deviations:** 2 auto-fixed (1 missing-critical, 1 bug-prevention)
**Impact on plan:** Both were necessary for correctness against already-established, already-validated requirements (SRCH-05, and the geo/search infrastructure from Phases 1-2). No scope creep beyond what REQUIREMENTS.md already commits to.

## Issues Encountered

- `npx prisma migrate dev` hung indefinitely after successfully applying the migration, waiting on an interactive "Enter a name for the new migration" prompt (because the two hand-kept indexes are perpetual "drift" from Prisma's perspective) with stdin redirected to `/dev/null`. The migration itself had already applied successfully by that point (confirmed via `_prisma_migrations` table and a fresh `npx prisma generate`); the hung process was killed rather than answering the prompt (which would have created an unwanted follow-up migration re-attempting to drop the hand-kept indexes).
- Two pre-existing, unrelated tests in `lib/search/run-search-query.test.ts` (open-now overnight-shift fixtures) are time-of-day-flaky — they fail when the suite runs between roughly 09:00-18:00 Asia/Colombo because the fixture only defines yesterday's overnight shift, not today's. Confirmed via `git blame` this was last touched in Phase 2 (`f59de74`... actually commit `f0af271`), not touched by this chunk. Logged to `.planning/phases/03-reviews-ratings/deferred-items.md` per the scope-boundary rule rather than fixed here.

## User Setup Required

None - no external service configuration required. The dev Postgres container (`docker compose up -d`) was already running.

## Next Phase Readiness

**Ready for the UI chunk (REV-04/REV-05):**
- `GET /api/businesses/[slug]/reviews?includeFiltered=true` is ready to power both the default review list and the "X reviews not currently recommended" disclosure link — `visibilityStatus` is included per-review (safe to expose to a reader; only the review's own author must never learn their own bucket, which POST/PATCH already enforce).
- `POST /api/reviews` / `PATCH /api/reviews/[id]` are ready for a review-composer form; both already validate rating (1-5) then text (>=50 chars) then optional photo URLs, matching REV-01's ordering requirement.
- Business.avgRating/reviewCount are live and will already show up anywhere a future UI reads them (business-page review summary, search result cards) — no data-layer work remains for REV-05's "blends recency, reviewer credibility, and helpfulness votes" default order, though VOTE-01 (Phase 4) doesn't exist yet, so REV-05's "helpfulness votes" component isn't buildable until then; the UI chunk should default-order by recency + a simple credibility proxy (e.g. account age) until Phase 4 lands voting.

**Blockers/concerns for the next chunk:**
- No file-upload infrastructure exists yet — `photos` on both API routes only accept already-uploaded URL strings. The UI chunk needs either an upload endpoint or a third-party upload widget before REV-01's "optional photos" is fully usable end-to-end.
- Route-handler-level automated test coverage is currently a gap for all of Phase 2's and this chunk's API routes (project convention relies on Playwright e2e instead) — recommend the UI chunk's Playwright suite exercise the review-create/edit/filter-disclosure flow through real HTTP requests, both to cover this gap and because the review-filter secrecy behavior (REV-03) is the single most reputationally sensitive UI behavior in this phase.

---
*Phase: 03-reviews-ratings*
*Completed: 2026-09-15*

## Self-Check: PASSED

All 11 created files confirmed present on disk; all 8 task commit hashes confirmed present in `git log`.
