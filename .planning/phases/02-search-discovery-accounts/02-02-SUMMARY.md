---
phase: 02-search-discovery-accounts
plan: 02
subsystem: database
tags: [postgres, tsvector, pg_trgm, postgis, prisma, search-ranking]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (plan 01)
    provides: "Business.searchable generated tsvector column + GIN index, pg_trgm name-trigram GIN index, Business.location geography(Point,4326) column with GiST index (Phase 1)"
provides:
  - "lib/search/run-search-query.ts — runSearchQuery(filters): single shared ranking+filter+pagination function (SEARCH_PAGE_SIZE=24, SearchFilters, SearchResult)"
  - "lib/search/geo-decay.ts — geoDecayScore(distanceKm, offsetKm?, scaleKm?)"
  - "lib/search/district-centroids.ts — districtCentroids, findNearestDistrict, lookupDistrictCentroid"
  - "lib/search/search-params.schema.ts — sortOptionSchema, searchParamsSchema, parseSearchParams"
affects: [02-04-search-page, 02-08-search-api-route]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single raw prisma.$queryRaw ranking function (Prisma.sql/Prisma.join parameter binding only) shared by both the future SSR search page and its client-fetch API route, avoiding ranking-SQL drift between them"
    - "Two-pass text search: primary tsvector pass, distinct pg_trgm similarity() fallback pass only on zero tsvector matches, never blended into the same ORDER BY"
    - "Open-now filtering as an application-layer post-filter over one batched findMany, reusing Phase 1's computeOpenNow verbatim instead of re-deriving overnight/holiday-override logic in SQL"

key-files:
  created:
    - lib/search/geo-decay.ts
    - lib/search/geo-decay.test.ts
    - lib/search/district-centroids.ts
    - lib/search/search-params.schema.ts
    - lib/search/run-search-query.ts
    - lib/search/run-search-query.test.ts
  modified: []

key-decisions:
  - "Test fixtures use invented category slugs (e.g. zzztest-restaurant-cat) and invented query words (e.g. bravinoxa, vexonflorp) rather than realistic-sounding restaurant terms, so ranking/filter/sort assertions are never polluted by coincidental matches in the real 107-row seed dataset"
  - "Open-now integration test fixtures are anchored to the real Asia/Colombo clock at fixture-creation time (multi-hour safety margins either side of 'now') rather than a fixed historical date, since SearchFilters' locked contract has no now-override parameter and runSearchQuery calls computeOpenNow with the real current time by default"
  - "radiusKm (SRCH-03's distance-radius filter) implemented via ST_DWithin on the geography column even though not explicitly enumerated in this plan's behavior list, since it's part of the exported SearchFilters contract 02-04/02-08 will consume directly"

requirements-completed: [SRCH-01, SRCH-03, SRCH-04, SRCH-05]

coverage:
  - id: D1
    description: "geoDecayScore implements the exact POWER(0.5,...) exponential decay formula (full score within offsetKm, halving every scaleKm), clamped to [0,1]"
    requirement: "SRCH-05"
    verification:
      - kind: unit
        ref: "lib/search/geo-decay.test.ts (21/21 tests pass: golden values at 0/1/6/11km, [0,1] clamp, custom offset/scale args)"
        status: pass
    human_judgment: false
  - id: D2
    description: "parseSearchParams/searchParamsSchema/sortOptionSchema — .strict() Zod schema applying sort=recommended/page=1 defaults, rejecting unrecognized keys, coercing URL-string lat/lng/page"
    requirement: "SRCH-04"
    verification:
      - kind: unit
        ref: "lib/search/geo-decay.test.ts (parseSearchParams/sortOptionSchema describe blocks)"
        status: pass
    human_judgment: false
  - id: D3
    description: "districtCentroids/findNearestDistrict/lookupDistrictCentroid cover exactly the 12 seeded district strings with working nearest-match and case-insensitive lookup"
    verification:
      - kind: unit
        ref: "lib/search/geo-decay.test.ts (districtCentroids/findNearestDistrict/lookupDistrictCentroid describe blocks)"
        status: pass
    human_judgment: false
  - id: D4
    description: "runSearchQuery ranks by weighted text-relevance (ts_rank_cd, normalization flag 32) + geo-decay + neutral rating term (D-02, never fabricated), with a distinct pg_trgm fallback pass on zero tsvector matches, never blended into the primary ORDER BY"
    requirement: "SRCH-01"
    verification:
      - kind: integration
        ref: "lib/search/run-search-query.test.ts — 'text relevance (SRCH-01)' describe block (4/4: tsvector match, zero-match empty result, pg_trgm fallback, adversarial SQL-fragment-as-search-text)"
        status: pass
    human_judgment: false
  - id: D5
    description: "category/priceTiers/attributeFilters compose with AND semantics in one query; every dynamic value is Prisma.sql/Prisma.join parameter-bound, never string-concatenated (T-02-01)"
    requirement: "SRCH-03"
    verification:
      - kind: integration
        ref: "lib/search/run-search-query.test.ts — 'filter composition (SRCH-03)' describe block (4/4)"
        status: pass
    human_judgment: false
  - id: D6
    description: "All 4 sort options (recommended/highest_rated/most_reviewed/distance) produce stable, deterministic order; distance falls back to recommended without an origin"
    requirement: "SRCH-04"
    verification:
      - kind: integration
        ref: "lib/search/run-search-query.test.ts — 'sort options (SRCH-04/SRCH-05)' describe block (5/5)"
        status: pass
    human_judgment: false
  - id: D7
    description: "open-now filter matches computeOpenNow exactly, applied as an application-layer post-filter after ranking/before pagination, with totalCount/totalPages recomputed against the post-filter count and exactly one batched hours/overrides findMany (no N+1)"
    requirement: "SRCH-03"
    verification:
      - kind: integration
        ref: "lib/search/run-search-query.test.ts — 'open-now application-layer post-filter (SRCH-03, Task 3)' describe block (3/3, including a findMany call-count spy)"
        status: pass
    human_judgment: false

duration: 26min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 02: Search Ranking Engine Summary

**Single shared `runSearchQuery()` combining Postgres tsvector text relevance + geo-decay + an honestly-neutral rating term into one raw-SQL ranking query, with pg_trgm typo fallback, AND-composed category/price/attribute filters, all 4 sort options, and Phase 1's `computeOpenNow` reused verbatim as an application-layer post-filter.**

## Performance

- **Duration:** 26 min (05:53–06:19 local, Asia/Colombo)
- **Started:** 2026-09-15T00:07:50Z
- **Completed:** 2026-09-15T00:33:54Z
- **Tasks:** 3
- **Files modified:** 6 (all new)

## Accomplishments
- `geoDecayScore` exponential-decay function + a 12-district centroid lookup table + a locked `.strict()` Zod search-params schema, all proven correct via 21 unit tests
- `runSearchQuery()` — the one raw-SQL escape hatch this phase needs — computes `ts_rank_cd` (normalization flag 32) + `POWER(0.5,...)` geo-decay + `RATING_SCORE_NEUTRAL` (D-02: never a fabricated average) into one weighted score, with a distinct pg_trgm `similarity()` fallback pass on zero tsvector matches
- Category/price-tier/attribute filters compose via `Prisma.sql`/`Prisma.join` fragments joined with AND — verified adversarial-SQL-as-search-text never executes (T-02-01)
- All 4 sort options implemented with deterministic behavior, including `distance`'s fallback-to-`recommended` when no origin is supplied and stable name-ASC ordering for `highest_rated`/`most_reviewed` (no real rating data exists until Phase 3, per Pitfall 2)
- Open-now filtering reuses `computeOpenNow` verbatim over exactly one batched `findMany` (zero N+1), applied before pagination so `totalCount`/`totalPages` stay honest for the filtered result

## Task Commits

Each task was committed atomically (TDD RED → GREEN per task):

1. **Task 1: Geo-decay function and search contract schemas** - `bf2369c` (test, RED) → `95cb878` (feat, GREEN)
2. **Task 2 [BLOCKING]: Ranking + filter composition query** - `800154e` (test, RED) → `7cc7121` (feat, GREEN)
3. **Task 3: Open-now application-layer post-filter and pagination correctness** - `f0af271` (test, RED) → `b5f492a` (feat, GREEN)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `lib/search/geo-decay.ts` - `geoDecayScore(distanceKm, offsetKm=1, scaleKm=5)`
- `lib/search/geo-decay.test.ts` - 21 tests (geoDecayScore, sortOptionSchema, parseSearchParams, districtCentroids, findNearestDistrict, lookupDistrictCentroid)
- `lib/search/district-centroids.ts` - `districtCentroids`, `findNearestDistrict`, `lookupDistrictCentroid`
- `lib/search/search-params.schema.ts` - `sortOptionSchema`, `searchParamsSchema`, `parseSearchParams`
- `lib/search/run-search-query.ts` - `runSearchQuery(filters)`, `SEARCH_PAGE_SIZE`, `SearchFilters`, `SearchResult`
- `lib/search/run-search-query.test.ts` - 17 integration tests against real local Postgres, self-cleaning `test-search-*`-slugged fixtures

## Decisions Made

- Test fixtures use invented category slugs (`zzztest-restaurant-cat`, etc.) and invented query words (`bravinoxa`, `vexonflorp`) instead of realistic restaurant terms, so ranking/filter/sort assertions are never polluted by coincidental matches against the real 107-row seed dataset
- Open-now integration test fixtures are anchored to the real Asia/Colombo clock at fixture-creation time (multi-hour safety margins) rather than a fixed historical date, since `SearchFilters`' locked contract exposes no `now`-override and `runSearchQuery` calls `computeOpenNow` with the real current time by default — matching how it will actually be invoked in production
- Implemented `radiusKm` (SRCH-03's distance-radius filter) via `ST_DWithin` even though not individually enumerated in this plan's behavior list, since it's part of the exported `SearchFilters` contract 02-04/02-08 will import directly and leaving it unimplemented would be a silent stub

## Deviations from Plan

None — plan executed exactly as written. Task 2 and Task 3 modify the same two files (`run-search-query.ts`/`.test.ts`); each task's RED/GREEN commit pair was constructed to represent that task's own incremental extension so the git history stays task-atomic.

## Issues Encountered

None. `npx tsc --noEmit`, `npx vitest run` (full suite, 77/77), and `npm run build` all pass cleanly after each task; the local Postgres+PostGIS+pg_trgm instance from 02-01 required no changes.

## User Setup Required

None — no external service configuration required. Uses the same local Docker Postgres instance and `Business.searchable`/trigram/GiST indexes 02-01 already migrated.

## Next Phase Readiness

- `runSearchQuery()`, `SearchFilters`, `SearchResult`, `SEARCH_PAGE_SIZE` are ready for 02-04 (SSR search page) and 02-08 (client-fetch API route) to import directly, per this plan's explicit "do not rename" contract
- `parseSearchParams`/`searchParamsSchema` are ready to parse `/search?find_desc=&find_loc=...` URL params in 02-04
- `districtCentroids`/`findNearestDistrict`/`lookupDistrictCentroid` are ready for the "where" search's typed district-name lookup path (D-10)
- No blockers.

## Self-Check: PASSED

All 6 created files (`lib/search/geo-decay.ts`, `lib/search/geo-decay.test.ts`,
`lib/search/district-centroids.ts`, `lib/search/search-params.schema.ts`,
`lib/search/run-search-query.ts`, `lib/search/run-search-query.test.ts`) confirmed
present on disk. All 6 task commits (`bf2369c`, `95cb878`, `800154e`, `7cc7121`,
`f0af271`, `b5f492a`) confirmed present in `git log`. Full test suite (`npx vitest run`)
passes 77/77; `npm run build` succeeds; no leftover `test-search-*` fixture rows
remain in Postgres after suite completion (verified via direct `psql` count).

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
