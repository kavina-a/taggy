---
phase: 02-search-discovery-accounts
plan: 04
subsystem: frontend
tags: [nextjs, search-ui, business-card, geolocation, server-components]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (plan 02)
    provides: "lib/search/run-search-query.ts (runSearchQuery, SearchFilters, SearchResult, SEARCH_PAGE_SIZE), lib/search/search-params.schema.ts (parseSearchParams), lib/search/district-centroids.ts (findNearestDistrict, lookupDistrictCentroid)"
provides:
  - "app/search/page.tsx — GET /search SSR entry, parses searchParams via parseSearchParams, calls runSearchQuery, renders SearchBar + result count + BusinessCard grid + empty state"
  - "app/api/search/route.ts — GET /api/search JSON route handler, identical runSearchQuery call, no duplicated ranking logic"
  - "components/search/search-bar.tsx — SearchBar client component (geolocation + district-centroid fallback, D-10)"
  - "components/directory/business-card.tsx — extended BusinessCardProps (priceTier, reviewCount, distanceKm, snippet, openNow, all optional and additive)"
affects: [02-08-filters-sort-map]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "BusinessCard's new search-context metadata block is gated behind a hasSearchContext flag (true iff any of priceTier/reviewCount/distanceKm/snippet/openNow is passed) so Phase 1's directory call site — which passes none of these — renders byte-identical to before, while any single new prop still activates the full metadata row"
    - "app/search/page.tsx computes openNow itself via one batched findMany({ hours, hoursOverrides }) + computeOpenNow (Pitfall 5), since runSearchQuery only computes openNow when the openNow *filter* is actually requested — the display-only case needed its own single batched fetch, not a per-card query"
    - "SearchBar's geolocation attempt is best-effort and non-blocking: navigator.geolocation.getCurrentPosition is called on mount with a 5s timeout; denial/unavailability/timeout silently falls back to the static 'Near you' placeholder, never blocking render or submit (D-10)"

key-files:
  created:
    - components/search/search-bar.tsx
    - components/search/search-bar.test.tsx
    - app/search/page.tsx
    - app/api/search/route.ts
  modified:
    - components/directory/business-card.tsx
    - components/directory/business-card.test.tsx

key-decisions:
  - "BusinessCard's price/reviews/distance/snippet/open-closed metadata block only renders when at least one new optional prop is passed (hasSearchContext), reconciling the plan's two behavior bullets ('renders exactly as before with no new props' vs. 'reviewCount undefined renders literal No reviews yet') — Phase 1's directory usage stays byte-identical while any single new prop still activates the full row"
  - "Used @testing-library/react's fireEvent instead of adding @testing-library/user-event as a new dependency — user-event isn't installed, isn't in 02-RESEARCH.md's audited package list, and RULE 3's package-install exclusion means a new npm install requires a legitimacy checkpoint rather than silent auto-fix; fireEvent covers this plan's synchronous change/click interactions without it"
  - "reviewCount > 0 renders '{n} reviews' (no star icon, no average) rather than a numeric rating, since no avgRating field exists anywhere in Phase 2's data model yet (D-02) — only reviewCount was added to BusinessCardProps per the plan's exact prop list; in practice this phase never actually passes a nonzero reviewCount (no review system exists until Phase 3), so every real card shows 'No reviews yet'"

requirements-completed: [SRCH-01, SRCH-02]

coverage:
  - id: D1
    description: "BusinessCard renders unchanged for Phase 1's directory call site (no new props); each new optional prop (priceTier badge, honest 'No reviews yet', formatted distanceKm, snippet, openNow badge with status-open/status-closed tokens, never red) renders correctly in isolation"
    requirement: "SRCH-02"
    verification:
      - kind: unit
        ref: "components/directory/business-card.test.tsx (10/10 tests pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "SearchBar navigates to /search with find_desc (no lat/lng) on free-text-only submit; includes lat/lng from a successful geolocation read; falls back to lookupDistrictCentroid(whereText) for lat/lng when geolocation is unavailable but the typed district text matches; 'where' placeholder shows the detected district label on geolocation success and 'Near you' otherwise (D-10)"
    requirement: "SRCH-01"
    verification:
      - kind: unit
        ref: "components/search/search-bar.test.tsx (5/5 tests pass, navigator.geolocation and lib/search/district-centroids mocked)"
        status: pass
    human_judgment: false
  - id: D3
    description: "/search and /api/search both call the identical runSearchQuery() — no duplicated ranking SQL between the SSR page and the Route Handler (T-02-01/T-02-09)"
    requirement: "SRCH-01"
    verification:
      - kind: manual_procedural
        ref: "curl http://localhost:3000/search?find_desc=cafe -> 200, 9 unique /business/<slug> cards, '9 results' count line; curl http://localhost:3000/api/search?find_desc=cafe -> 200, businesses.length === 9 (matches SSR); curl http://localhost:3000/search (no params) -> 200, 24 cards (SEARCH_PAGE_SIZE), '107 results' count line against the full seeded dataset"
        status: pass
      - kind: automated
        ref: "npm run build (Next.js 16 production build succeeds, both routes compile: ƒ /api/search, ƒ /search)"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 04: Search Results Page & SearchBar Summary

**Ships the first end-to-end demonstrable slice of search: a real `SearchBar` (geolocation + typed-district fallback) submits to a real `/search` page rendering ranked, rich `BusinessCard`s from `runSearchQuery`, with the identical query also served as JSON via `GET /api/search`.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-15T06:14:44+05:30 (approx., immediately following 02-03)
- **Completed:** 2026-09-15T06:23:02+05:30
- **Tasks:** 3
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments
- `BusinessCard` extended with 5 new optional props (`priceTier`, `reviewCount`, `distanceKm`, `snippet`, `openNow`) — all additive, gated behind a `hasSearchContext` check so Phase 1's `/directory` page (which passes none of them) renders unchanged; "No reviews yet" is rendered whenever `reviewCount` is 0/absent, never a fabricated star rating or "0.0" (D-02, UI-SPEC copywriting contract)
- `SearchBar` client component: best-effort, non-blocking `navigator.geolocation.getCurrentPosition` on mount (5s timeout, silent fallback), resolves the "where" placeholder to the nearest district label via `findNearestDistrict` on success, and falls back to `lookupDistrictCentroid(whereText)` for lat/lng at submit time when geolocation didn't resolve but the typed text matches a known district (D-10)
- `app/search/page.tsx` — async Server Component parsing `searchParams` via `parseSearchParams`, calling `runSearchQuery`, and rendering the `SearchBar` (pre-filled from the URL) + result count line + `BusinessCard` grid + "No matches found" empty state; computes `openNow` for display via one batched `findMany` + `computeOpenNow` (Pitfall 5 — never per-card)
- `app/api/search/route.ts` — `GET` Route Handler calling the identical `runSearchQuery`, returning `SearchResult` as JSON, with zero duplicated ranking logic
- Verified against the real 107-business seeded dataset: `/search?find_desc=cafe` returns 9 matching cards with correct price-tier badges and closed-status badges; `GET /api/search?find_desc=cafe` returns `businesses.length === 9`, matching the SSR page exactly; `/search` with no params renders the default 24/page recommended-sorted list out of 107 total

## Task Commits

Each task was committed atomically (TDD RED → GREEN for Tasks 1-2; Task 3 is non-TDD `type="auto"`):

1. **Task 1: Extend BusinessCard with search-context props** - `152fb65` (test, RED) → `0512642` (feat, GREEN)
2. **Task 2: SearchBar component (geolocation + district-centroid fallback)** - `80c0d00` (test, RED) → `a412768` (feat, GREEN)
3. **Task 3: /search SSR page and /api/search route handler** - `f40734e` (feat)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `components/directory/business-card.tsx` - extended `BusinessCardProps` with `priceTier`/`reviewCount`/`distanceKm`/`snippet`/`openNow`, all optional
- `components/directory/business-card.test.tsx` - 10 tests covering the no-regression case and every new prop
- `components/search/search-bar.tsx` - `SearchBar` client component
- `components/search/search-bar.test.tsx` - 5 tests (`navigator.geolocation` and `lib/search/district-centroids` mocked, `fireEvent`-based)
- `app/search/page.tsx` - `GET /search` Server Component
- `app/api/search/route.ts` - `GET /api/search` Route Handler (`GET` export)

## Decisions Made

- `BusinessCard`'s new metadata block (price/reviews/distance/snippet/open-closed) only renders when `hasSearchContext` is true (i.e. at least one of the 5 new props was passed) — reconciles the plan's "renders exactly as before with no new props" requirement against "reviewCount undefined renders 'No reviews yet'" without contradiction
- Used `@testing-library/react`'s `fireEvent` instead of installing `@testing-library/user-event` — that package isn't in 02-RESEARCH.md's audited Standard Stack, and adding an unresearched dependency mid-execution falls under the deviation rules' package-install exclusion (legitimacy-checkpoint territory, not a silent auto-fix); `fireEvent` covers every interaction this plan's tests need
- `reviewCount > 0` renders `"{n} reviews"` (no star icon, no numeric average) since no `avgRating` field exists anywhere in the data model until Phase 3 — in practice this phase never passes a nonzero `reviewCount` from `/search` (no review system exists yet), so every real card currently shows "No reviews yet"

## Deviations from Plan

None — plan executed exactly as written. The `hasSearchContext` gating decision above is an implementation-detail resolution of an ambiguity between two of the plan's own behavior bullets, not a deviation from the plan's stated scope, files, or artifacts.

## Issues Encountered

None. `npx tsc --noEmit`, `npx vitest run` (full suite, 100/100), and `npm run build` all pass cleanly. Manual `curl` verification against the real local Postgres+PostGIS instance (already running from 02-01/02-02) required no setup changes.

## User Setup Required

None — no external service configuration required. Uses the same local Docker Postgres instance and seeded 107-business dataset from Phase 1/02-01.

## Next Phase Readiness

- `/search` and `GET /api/search` are both live, guest-reachable, and ready for 02-08 to layer the filter sidebar/sheet, sort dropdown, and map on top — this plan deliberately left `categories`/`priceTiers`/`attributeFilters`/`openNow`/`radiusKm` unwired in the page/route's `SearchFilters` construction, per the plan's explicit scope boundary
- `SearchBar`'s `initialFindDesc`/`initialFindLoc` props are ready for 02-08 to also pre-fill filter state from the URL if needed
- `BusinessCard`'s new optional props are ready for the home-page discovery rails (02-06) to reuse, if a condensed rail variant wants price/distance/open-closed without the snippet
- No blockers.

## Self-Check: PASSED

All 4 created files (`components/search/search-bar.tsx`, `components/search/search-bar.test.tsx`,
`app/search/page.tsx`, `app/api/search/route.ts`) confirmed present on disk. All 5 task commits
(`152fb65`, `0512642`, `80c0d00`, `a412768`, `f40734e`) confirmed present in `git log`. Full test
suite (`npx vitest run`) passes 100/100; `npm run build` succeeds; manual `curl` verification
against the real 107-business seeded dataset confirmed matching counts between `/search` and
`GET /api/search` for the same query.

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
