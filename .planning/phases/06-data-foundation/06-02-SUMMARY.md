---
phase: 06-data-foundation
plan: 02
subsystem: database
tags: [prisma, postgres, search, home-page, isTest, DATA-03]

requires:
  - phase: 06-data-foundation
    provides: isTest Boolean @default(false) field on Business/Review/User (06-01 schema migration)
provides:
  - isTest:false server-side filtering on every Business read path in the search engine, open-now lookup, and home-page rail loaders
  - Three new isTest-filtered load-rails.ts exports (getTrendingBusinessIds, loadBusinessesByIds, loadNewBusinesses) replacing app/page.tsx's inline Prisma calls
affects: [06-03, 06-04, 06-05, 06-06, 06-07, phase-07-design-system]

tech-stack:
  added: []
  patterns:
    - "isTest:false as an unconditional base WHERE condition (raw SQL and Prisma-client where objects alike), never an optional/toggleable filter"
    - "Every Prisma path touching Business independently enforces isTest:false, even when an upstream query already filtered it (defense in depth)"

key-files:
  created:
    - lib/home/load-rails.test.ts
  modified:
    - lib/search/run-search-query.ts
    - lib/search/business-open-now.ts
    - lib/search/run-search-query.test.ts
    - lib/home/load-rails.ts
    - app/page.tsx

key-decisions:
  - "computeOpenNowByBusinessId's isTest-exclusion test lives in run-search-query.test.ts (imported from ./business-open-now) rather than a new dedicated test file, matching the plan's literal <files> list for Task 1"
  - "load-rails.ts's own separate (pre-existing, duplicate) computeOpenNowByBusinessId implementation was left untouched — out of scope per the plan's literal task actions/acceptance-criteria grep counts, and its callers only ever receive ids already isTest-filtered upstream"

requirements-completed: [DATA-03]

coverage:
  - id: D1
    description: "runSearchQuery excludes isTest:true businesses from both the raw-SQL ranked-candidate query and the hydration findMany"
    requirement: "DATA-03"
    verification:
      - kind: unit
        ref: "lib/search/run-search-query.test.ts#runSearchQuery — isTest exclusion (DATA-03) > never returns an isTest:true business even when it uniquely matches the category filter"
        status: pass
    human_judgment: false
  - id: D2
    description: "computeOpenNowByBusinessId (lib/search/business-open-now.ts) filters isTest:true ids out of its underlying findMany"
    requirement: "DATA-03"
    verification:
      - kind: unit
        ref: "lib/search/run-search-query.test.ts#runSearchQuery — isTest exclusion (DATA-03) > computeOpenNowByBusinessId filters an isTest:true id out of its underlying findMany, not just the returned Map"
        status: pass
    human_judgment: false
  - id: D3
    description: "loadTopRatedBusinesses and loadRelatedBusinesses exclude isTest:true businesses"
    requirement: "DATA-03"
    verification:
      - kind: unit
        ref: "lib/home/load-rails.test.ts#loadTopRatedBusinesses — isTest exclusion (DATA-03)"
        status: pass
      - kind: unit
        ref: "lib/home/load-rails.test.ts#loadRelatedBusinesses — isTest exclusion (DATA-03)"
        status: pass
    human_judgment: false
  - id: D4
    description: "New load-rails.ts exports getTrendingBusinessIds/loadNewBusinesses/loadBusinessesByIds exclude isTest:true businesses; app/page.tsx uses them instead of inline Prisma calls"
    requirement: "DATA-03"
    verification:
      - kind: unit
        ref: "lib/home/load-rails.test.ts#getTrendingBusinessIds — isTest exclusion (DATA-03)"
        status: pass
      - kind: unit
        ref: "lib/home/load-rails.test.ts#loadNewBusinesses — isTest exclusion (DATA-03)"
        status: pass
      - kind: unit
        ref: "lib/home/load-rails.test.ts#loadBusinessesByIds — isTest exclusion (DATA-03)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit && npm run build"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-09-25
status: complete
---

# Phase 6 Plan 2: isTest Read-Filter Enforcement (Search/Home) Summary

**`isTest: false` enforced server-side across every Business read on the search engine, open-now lookup, and home-page rails — including extracting app/page.tsx's three inline Prisma calls into new isTest-filtered load-rails.ts loaders — all proven by 9 new automated tests.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-25T05:47:00Z (approx.)
- **Completed:** 2026-09-25T05:55:00Z
- **Tasks:** 3
- **Files modified:** 6 (1 created, 5 modified)

## Accomplishments

- `runRankedCandidateQuery`'s raw SQL and `runSearchQuery`'s hydration `findMany` both independently enforce `isTest = false` on `Business`
- `computeOpenNowByBusinessId` (lib/search/business-open-now.ts) excludes `isTest:true` rows from its batched `findMany`
- `loadTopRatedBusinesses` and `loadRelatedBusinesses` (lib/home/load-rails.ts) exclude `isTest:true` businesses
- `app/page.tsx`'s three inline `prisma.business.findMany` calls extracted into three new isTest-filtered `load-rails.ts` exports: `getTrendingBusinessIds`, `loadBusinessesByIds`, `loadNewBusinesses` — `app/page.tsx` no longer imports `prisma` or contains any inline Prisma call
- 9 new automated tests across `lib/search/run-search-query.test.ts` and the new `lib/home/load-rails.test.ts`, all passing

## Task Commits

Each task followed RED → GREEN (test-first, `tdd="true"`):

1. **Task 1: isTest filtering on the search engine and open-now lookup**
   - `14d1558` test(06-02): add failing isTest-exclusion tests for search and open-now lookup
   - `3e0fe06` feat(06-02): enforce isTest:false filter on search engine and open-now lookup
2. **Task 2: isTest filtering on the two existing rail loaders**
   - `2faba8d` test(06-02): add failing isTest-exclusion tests for the two rail loaders
   - `73254fe` feat(06-02): enforce isTest:false filter on loadTopRatedBusinesses and loadRelatedBusinesses
3. **Task 3: Extract and filter app/page.tsx's three inline home-page queries**
   - `37abaf7` test(06-02): add failing isTest-exclusion tests for the three new home-page loaders
   - `ea1d510` feat(06-02): extract app/page.tsx's inline Prisma calls into isTest-filtered load-rails.ts loaders

## Files Created/Modified

- `lib/search/run-search-query.ts` - Raw-SQL `WHERE "isTest" = false AND ...` base condition; hydration `findMany` adds `isTest: false`
- `lib/search/business-open-now.ts` - `computeOpenNowByBusinessId`'s `findMany` adds `isTest: false`
- `lib/search/run-search-query.test.ts` - Extended with `isTest?: boolean` fixture field, `CAT_ISTEST` fixture, and a new "isTest exclusion (DATA-03)" describe block covering both `runSearchQuery` and `computeOpenNowByBusinessId`
- `lib/home/load-rails.ts` - `isTest: false` added to `loadTopRatedBusinesses`/`loadRelatedBusinesses`; three new exports (`getTrendingBusinessIds`, `loadBusinessesByIds`, `loadNewBusinesses`) extracted from `app/page.tsx`, all isTest-filtered
- `lib/home/load-rails.test.ts` (new) - Fixture-based isTest-exclusion coverage for all five isTest-filtered loaders in this file
- `app/page.tsx` - Imports the three new `load-rails.ts` loaders instead of inline `prisma.business.findMany`; removed local `stableHash`/`getTrendingIds` helpers and the now-unused `createHash`/`prisma` imports; presentation-only `trendingOrder`/`trendingRows.sort` logic left unchanged

## Decisions Made

- `computeOpenNowByBusinessId`'s isTest-exclusion test was added to `run-search-query.test.ts` (importing from `./business-open-now`) rather than a new dedicated test file, since the plan's `<files>` list for Task 1 only names `run-search-query.test.ts`
- `lib/home/load-rails.ts` has its own separate, pre-existing `computeOpenNowByBusinessId` implementation (duplicate of `lib/search/business-open-now.ts`, used by `app/page.tsx`'s open-now badge). This was left untouched: the plan's Task 2/Task 3 action text and acceptance-criteria grep counts (`isTest: false` matching exactly 5 lines total in `load-rails.ts`) only cover `loadTopRatedBusinesses`, `loadRelatedBusinesses`, `getTrendingBusinessIds`, `loadBusinessesByIds`, `loadNewBusinesses`. Its callers (`loadTopRatedBusinesses` and `app/page.tsx`) only ever pass in ids that were already isTest-filtered upstream, so no data-leakage gap exists in practice — flagging here for visibility rather than expanding scope unrequested.

## Deviations from Plan

None — plan executed exactly as written across all 3 tasks. One pre-existing, unrelated issue was discovered and logged (not fixed, per Scope Boundary) rather than treated as a deviation:

- **Pre-existing test flakiness (out of scope, logged to `.planning/phases/06-data-foundation/deferred-items.md`):** Two tests in `lib/search/run-search-query.test.ts`'s "open-now application-layer post-filter" describe block (unrelated to this plan's isTest work — untouched by any of this plan's edits) fail when the suite runs after ~09:00 Asia/Colombo, because the `beforeAll` open-now fixture hardcodes an 18:00-09:00 overnight window instead of anchoring relative to the actual run-time hour. Observed failing during this execution (ran ~11:20 Colombo). Not caused by 06-02's changes; left as-is per the Scope Boundary rule (only auto-fix issues directly caused by the current task).

## Issues Encountered

None beyond the pre-existing flakiness documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- DATA-03's search/home/rails read-path enforcement is complete: every `Business` read on the guest-facing `/search` and `/` (home) surfaces filters `isTest: false` server-side, proven by automated tests.
- Remaining DATA-03 surfaces per 06-PATTERNS.md's Shared Patterns section (`app/api/businesses/[slug]/route.ts` + sub-routes, `app/api/listings/route.ts`, `app/api/collections/[id]/items/route.ts`) are out of this plan's scope — expected to be covered by a later 06-0X plan.
- The pre-existing open-now fixture time-of-day flakiness (see Deferred Items) should be fixed before it causes an unrelated CI failure in a future run.

---
*Phase: 06-data-foundation*
*Completed: 2026-09-25*

## Self-Check: PASSED

All created/modified files verified present on disk; all 6 task commit hashes verified present in git log.
