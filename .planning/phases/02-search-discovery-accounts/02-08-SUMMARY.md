---
phase: 02-search-discovery-accounts
plan: 08
subsystem: frontend
tags: [nextjs, search-ui, leaflet, filters, sort, react-client-components]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (plan 02)
    provides: "lib/search/run-search-query.ts (runSearchQuery, SearchFilters), lib/search/search-params.schema.ts (parseSearchParams)"
  - phase: 02-search-discovery-accounts (plan 04)
    provides: "app/search/page.tsx (SSR entry), app/api/search/route.ts (JSON route), components/search/search-bar.tsx, components/directory/business-card.tsx (extended props)"
provides:
  - "components/search/filter-sidebar.tsx / filter-sheet.tsx — desktop/mobile filter controls (category, price tier, open-now, distance radius, rating threshold, category-conditional attributes)"
  - "components/search/sort-dropdown.tsx — 4-option sort control"
  - "components/search/search-experience.tsx — client orchestrator wiring filters/sort/results/map together on top of 02-04's SSR page"
  - "components/search/search-results-map(-dynamic).tsx — multi-pin Leaflet map for search results"
  - "lib/search/search-filters-from-params.ts, lib/search/attrs-param.ts, lib/search/business-open-now.ts, lib/search/serialize-search-result.ts, lib/search/business-card-props.ts — shared param/result conversion helpers used by both app/search/page.tsx and app/api/search/route.ts"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single useSearchFilterState hook instance (owned by SearchExperience) drives FilterSidebar/FilterSheet/SortDropdown via props/callbacks rather than each component independently syncing the URL — avoids racing independent fetches against a results list only one owner should update"
    - "URL sync uses raw window.history.replaceState (never next/navigation's router.replace) so a filter/sort change never triggers a full Server Component RSC round-trip; only a dedicated debounced GET /api/search fetch refreshes the visible results"
    - "Category-conditional boolean attribute filters serialize into one fixed URL key (attrs=key:true,key2:true) since search-params.schema.ts's .strict() schema can't enumerate every category's dynamic attribute keys ahead of time"
    - "getBooleanAttributeFields (category-config.ts) derives a category's boolean-typed attribute keys via schema.partial().safeParse({}) rather than reaching into Zod's internal schema representation — .partial() is required because several category schemas have a non-defaulted required priceTier field that would otherwise fail an empty-object parse entirely"
    - "openNow annotation is centralized in lib/search/serialize-search-result.ts (calling the batched, N+1-safe computeOpenNowByBusinessId) so both the SSR initial render and every live client-side re-fetch show an identically-correct open/closed badge"

key-files:
  created:
    - components/search/filter-state.ts
    - components/search/filter-fields.tsx
    - components/search/filter-sidebar.tsx
    - components/search/filter-sidebar.test.tsx
    - components/search/filter-sheet.tsx
    - components/search/filter-sheet.test.tsx
    - components/search/sort-dropdown.tsx
    - components/search/sort-dropdown.test.tsx
    - components/search/use-search-filter-state.ts
    - components/search/search-experience.tsx
    - components/search/search-results-map.tsx
    - components/search/search-results-map-dynamic.tsx
    - lib/search/attrs-param.ts
    - lib/search/business-card-props.ts
    - lib/search/business-open-now.ts
    - lib/search/search-filters-from-params.ts
    - lib/search/serialize-search-result.ts
  modified:
    - app/search/page.tsx
    - app/api/search/route.ts
    - lib/search/search-params.schema.ts
    - lib/categories/category-config.ts
    - components/business/business-map.tsx

key-decisions:
  - "The plan describes FilterSidebar/FilterSheet each using 'a shared internal hook such as useSearchFilterState' to avoid duplicated markup. Implemented as two layers: filter-state.ts + filter-fields.tsx (Task 1's shared types/markup, imported by both variants) plus use-search-filter-state.ts (Task 3, a single hook instance owned by SearchExperience, passed down to Sidebar/Sheet/SortDropdown as props/callbacks). A single shared instance was necessary for correctness — the map and results grid must reflect the exact committed result set the filter/sort controls just produced, which independent per-control hook instances racing separate fetches could not guarantee."
  - "URL updates use raw history.replaceState instead of next/navigation's router.replace, so a filter tap never triggers a full Server Component re-fetch of the whole page — only the dedicated debounced /api/search fetch updates the visible results, matching 02-UI-SPEC.md's mobile-performance guidance to avoid the Server-Component-only pattern reloading the whole page on every filter tap."
  - "Category-conditional attribute filters use a single fixed 'attrs' URL query key (format key:true,key2:true) rather than one query key per attribute, since the underlying attribute key set is category-dependent and can't be enumerated in search-params.schema.ts's locked .strict() schema ahead of time."
  - "Rating threshold chips above 'Any' are rendered as natively-disabled buttons with a title tooltip ('Ratings launch in a future update') per 02-RESEARCH.md Pitfall 1 / CONTEXT.md D-02 — option (a) from the plan's read_first guidance, not a silent no-op."
  - "DEFAULT_ICON (Leaflet marker-icon CDN-URL fix) is exported from components/business/business-map.tsx and reused by the new multi-pin components/search/search-results-map.tsx, rather than duplicating that known Leaflet bundler gotcha a second time."

requirements-completed: [SRCH-02, SRCH-03, SRCH-04]

coverage:
  - id: D1
    description: "FilterSidebar (desktop) and FilterSheet (mobile) render the full filter set (category checklist from categoryTaxonomy, category-conditional boolean attribute checkboxes, price-tier chips, open-now, distance-radius slider with 1/3/5/10/25km stops, rating chips); the three above-Any rating chips are natively disabled with a title tooltip; FilterSidebar applies changes immediately, FilterSheet stages a draft with a live debounced candidate-count preview on its apply button and only commits on 'Show {N} results' or 'Clear all'"
    requirement: "SRCH-03"
    verification:
      - kind: unit
        ref: "components/search/filter-sidebar.test.tsx (8/8 pass), components/search/filter-sheet.test.tsx (4/4 pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "SortDropdown renders exactly the 4 locked options (Recommended/Highest Rated/Most Reviewed/Distance) in order, defaults to Recommended, shows the current selection's label, and calls onSortChange with the selected value"
    requirement: "SRCH-04"
    verification:
      - kind: unit
        ref: "components/search/sort-dropdown.test.tsx (4/4 pass)"
        status: pass
    human_judgment: false
  - id: D3
    description: "/search and GET /api/search both build the full SearchFilters shape (categories/priceTiers/attributeFilters/openNow/radiusKm) via the shared buildSearchFiltersFromParams helper and return openNow-annotated results via serializeSearchResult; a category filter narrows results, openNow=true removes closed businesses, and attrs=key:true composes correctly with category"
    requirement: "SRCH-03"
    verification:
      - kind: manual_procedural
        ref: "Against the real seeded 107-business dataset: GET /api/search?category=restaurant -> 21 results (all openNow field present); GET /api/search?openNow=true -> 15 results, every returned business's openNow is true; GET /api/search?category=restaurant&attrs=delivery:true -> 2 results; GET /api/search?category=zzznonexistent -> 0 results with a rendered 'Clear filters' link (filter active) vs a text-only search with 0 results rendering no 'Clear filters' link (no filter active)"
        status: pass
      - kind: automated
        ref: "npm run build (Next.js 16 production build succeeds: /search, /api/search, /directory, /business/[slug] all compile)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Desktop /search renders a sticky right-hand SearchResultsMap panel (~42% width) with one pin per current result; mobile renders a 'Map' full-screen toggle using the same lazy react-leaflet + marker-icon-fix pattern as components/business/business-map.tsx"
    requirement: "SRCH-02"
    verification:
      - kind: manual_procedural
        ref: "GET /search?category=restaurant&sort=distance HTML response contains data-testid=\"search-results-map\", a Filters trigger, and a Sort by control; no runtime errors in the dev server log across all curl checks"
        status: pass
    human_judgment: true
    rationale: "Visual map rendering (marker positions, sticky panel width, mobile full-screen overlay) requires a browser viewport to fully confirm; HTML-presence and build verification confirm the wiring is correct but not the final rendered layout."

duration: 22min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 08: Search Filters, Sort & Map Summary

**Layers a shared-hook-driven filter sidebar/sheet, a 4-option sort dropdown, and a multi-pin Leaflet results map onto 02-04's already-working `/search` page, completing SRCH-02/03/04 without duplicating the ranking/filter-parsing logic between the SSR page and the live-filter API route.**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-09-15T01:23:01Z (immediately following 02-07)
- **Completed:** 2026-09-15T01:45:35Z
- **Tasks:** 3
- **Files modified:** 22 (17 created, 5 modified)

## Accomplishments

- `FilterSidebar`/`FilterSheet` share one internal markup component (`FilterFields`) and one filter-state module (`filter-state.ts`) — category checklist sourced from `categoryTaxonomy`, category-conditional boolean attribute checkboxes (derived from each category's Zod schema via `getBooleanAttributeFields`), price-tier chips, open-now, a 1/3/5/10/25km distance slider, and rating-threshold chips where the three above-`Any` options are natively `disabled` with an explanatory `title` tooltip (02-RESEARCH.md Pitfall 1) rather than a silent no-op
- `FilterSidebar` applies every change immediately (no apply step); `FilterSheet` stages edits in local draft state with a live debounced candidate-count preview on its "Show {N} results" apply button, plus a "Clear all" reset — matching CONTEXT.md D-08's sidebar/sheet split exactly
- `SortDropdown` renders the 4 locked SRCH-04 options in order with "Recommended" as the default current value
- `SearchExperience` (new client-boundary component) orchestrates a single `useSearchFilterState` hook instance that drives all three controls, updates the URL via `history.replaceState` (never a full Server Component round-trip), and debounced-fetches `GET /api/search` to refresh only the results grid and map
- Desktop renders a sticky, ~42%-width `SearchResultsMap` panel always visible alongside results; mobile renders a "Map" full-screen toggle — both reuse `business-map.tsx`'s Leaflet marker-icon fix (now exported as `DEFAULT_ICON`) and `business-map-dynamic.tsx`'s `ssr:false` dynamic-import pattern rather than a second map library/wrapper
- Empty state shows UI-SPEC's exact copy plus a "Clear filters" link only when a filter is actually active; a live-refetch failure shows an honest "Something went wrong" / "Retry" error state
- `app/search/page.tsx` and `app/api/search/route.ts` both now build the complete `SearchFilters` shape (categories/priceTiers/attributeFilters/openNow/radiusKm) and return `openNow`-annotated results through shared helpers (`buildSearchFiltersFromParams`, `serializeSearchResult`) — zero duplicated parsing/annotation logic between the two routes
- Verified against the real 107-business seeded dataset: category filter narrows results (21 for `restaurant`), `openNow=true` returns only currently-open businesses (15/107, all annotated `openNow: true`), category+attribute composition works (`restaurant` + `delivery:true` → 2), and the zero-result empty state correctly shows/hides "Clear filters" based on whether a filter is active

## Task Commits

1. **Task 1: Filter sidebar (desktop) and filter sheet (mobile)** - `56e7901` (test, RED) → `5919ac8` (feat, GREEN)
2. **Task 2: Sort dropdown wiring** - `7e9e572` (test, RED) → `5a1d0a2` (feat, GREEN)
3. **Task 3: Wire filters/sort into /search, add map toggle, finish empty/error states** - `cba0603` (feat)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `components/search/filter-state.ts` - shared `FilterState` shape, defaults, URL-param merge helper
- `components/search/filter-fields.tsx` - shared checkbox/slider/chip markup for both filter variants
- `components/search/filter-sidebar.tsx` / `.test.tsx` - desktop inline filter panel
- `components/search/filter-sheet.tsx` / `.test.tsx` - mobile bottom-sheet filter drawer
- `components/search/sort-dropdown.tsx` / `.test.tsx` - 4-option sort control
- `components/search/use-search-filter-state.ts` - URL-sync + debounced-refetch hook
- `components/search/search-experience.tsx` - client orchestrator (filters + sort + results + map + empty/error states)
- `components/search/search-results-map.tsx` / `-dynamic.tsx` - multi-pin Leaflet map for search results
- `lib/search/search-filters-from-params.ts` - shared `SearchParams` → `SearchFilters` conversion
- `lib/search/attrs-param.ts` - category-conditional attribute URL param parser
- `lib/search/business-open-now.ts` - batched openNow computation (moved out of page.tsx, now shared)
- `lib/search/serialize-search-result.ts` - shared `SearchResult` → JSON conversion (with openNow annotation)
- `lib/search/business-card-props.ts` - shared JSON business shape + `BusinessCard` prop mapper
- `app/search/page.tsx` - SSR entry now builds the full `SearchFilters` shape and renders `SearchExperience`
- `app/api/search/route.ts` - now returns the same full-filter, openNow-annotated JSON shape
- `lib/search/search-params.schema.ts` - added `attrs` optional field
- `lib/categories/category-config.ts` - added `getBooleanAttributeFields`
- `components/business/business-map.tsx` - exported `DEFAULT_ICON` for reuse

## Decisions Made

See `key-decisions` in frontmatter above (shared-hook architecture, `history.replaceState` over `router.replace`, fixed `attrs` URL key, disabled rating chips, shared `DEFAULT_ICON`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Category-conditional attribute filters had no URL param mechanism**
- **Found during:** Task 3 (planning the full `SearchFilters` wiring)
- **Issue:** Task 1's filter controls needed to serialize category-conditional attribute checkboxes into the URL (per Task 1's own behavior contract), but `search-params.schema.ts`'s locked `.strict()` schema had no field for arbitrary, category-dependent attribute keys, and `attributeFilters` had no way to flow from a URL into `runSearchQuery`.
- **Fix:** Added a single fixed `attrs` query key (`key:true,key2:true` format) plus `lib/search/attrs-param.ts`'s parser, wired through `buildSearchFiltersFromParams`.
- **Files modified:** `lib/search/search-params.schema.ts`, `lib/search/attrs-param.ts`, `lib/search/search-filters-from-params.ts`
- **Verification:** `GET /api/search?category=restaurant&attrs=delivery:true` returns a narrower, correct result set (2 businesses) against the real seeded dataset.
- **Committed in:** `cba0603`

**2. [Rule 1 - Bug] `getBooleanAttributeFields` returned `[]` for every category with a required `priceTier` field**
- **Found during:** Task 1, while writing `filter-sidebar.test.tsx`'s category-conditional attribute test
- **Issue:** `schema.safeParse({})` fails entirely (not just for the `priceTier` key) when a Zod object has a required field with no `.default()`/`.optional()` — which is most category schemas (`priceTier` is required in 10 of 16). The helper silently returned no boolean fields for any of them.
- **Fix:** Parse via `schema.partial().safeParse({})` instead, making every field optional for this introspection-only parse without disturbing the `.default()` behavior of the boolean fields being inspected.
- **Files modified:** `lib/categories/category-config.ts`
- **Verification:** `filter-sidebar.test.tsx`'s "shows category-conditional boolean attribute checkboxes" test passes; `Delivery` now correctly appears/disappears when the `restaurant` category is toggled.
- **Committed in:** `5919ac8`

**3. [Rule 2 - Missing critical functionality] Live client-side re-fetches would have shown a stale/missing open-now badge**
- **Found during:** Task 3
- **Issue:** `GET /api/search` (used by the new debounced live-filter fetch) previously returned raw `runSearchQuery` output with no `openNow` field — a live filter change would have silently dropped the open/closed badge from every result card, a regression from the SSR-only initial render.
- **Fix:** Centralized the batched `computeOpenNowByBusinessId` annotation into `lib/search/serialize-search-result.ts`, called by both `app/search/page.tsx` and `app/api/search/route.ts`.
- **Files modified:** `lib/search/business-open-now.ts` (moved out of `page.tsx`), `lib/search/serialize-search-result.ts`, `app/api/search/route.ts`
- **Verification:** `GET /api/search?openNow=true` — every returned business carries `openNow: true` in the seeded-dataset check above.
- **Committed in:** `cba0603`

None of the above required an architectural checkpoint (Rule 4) — all were additive/corrective within the plan's own stated scope and file list's spirit.

## Issues Encountered

None blocking. `npx tsc --noEmit`, `npx vitest run` (full suite, 137/137), and `npm run build` all pass cleanly. Manual `curl` verification against the real local Postgres+PostGIS instance and 107-business seeded dataset (Docker container already running) confirmed correct filter/sort/openNow/empty-state behavior end to end.

Radix's `DropdownMenu`/`Sheet`/`Slider` primitives required jsdom test polyfills (`ResizeObserver`, `scrollIntoView`, `hasPointerCapture`/`releasePointerCapture`) and, for `DropdownMenuTrigger` specifically, opening via a keyboard `Enter` keydown rather than `fireEvent.click` — Radix's trigger opens on `pointerdown`, which jsdom's `fireEvent.click` never dispatches. Both are test-only concerns; production behavior is unaffected (real browsers dispatch `pointerdown` naturally).

## User Setup Required

None — no new environment variables, external services, or infrastructure. Uses the same local Docker Postgres+PostGIS instance and seeded dataset already running from Phase 1/02-01.

## Next Phase Readiness

- `/search` now fully supports SRCH-02 (map)/SRCH-03 (filters)/SRCH-04 (sort) end to end, matching 02-UI-SPEC.md's Screen 1 exactly (desktop sidebar + sticky map, mobile sheet + map toggle)
- Rating-threshold filtering is honestly disabled above "Any" until Phase 3 introduces real rating data — no follow-up work needed here beyond swapping the disabled state for a real `WHERE avgRating >=` clause once `avg_rating`/`review_count` exist
- The `attrs` URL param convention and `getBooleanAttributeFields` helper are available for any future phase that needs to read/write category-conditional attribute filters elsewhere (e.g. a future saved-search feature)
- No blockers

## Self-Check: PASSED

All 17 created files confirmed present on disk (`components/search/filter-state.ts`,
`filter-fields.tsx`, `filter-sidebar.tsx`/`.test.tsx`, `filter-sheet.tsx`/`.test.tsx`,
`sort-dropdown.tsx`/`.test.tsx`, `use-search-filter-state.ts`, `search-experience.tsx`,
`search-results-map.tsx`/`-dynamic.tsx`, `lib/search/attrs-param.ts`,
`business-card-props.ts`, `business-open-now.ts`, `search-filters-from-params.ts`,
`serialize-search-result.ts`). All 5 task commits (`56e7901`, `5919ac8`, `7e9e572`,
`5a1d0a2`, `cba0603`) confirmed present in `git log`. Full test suite (`npx vitest run`)
passes 137/137; `npx tsc --noEmit` and `npm run build` both succeed; manual `curl`
verification against the real seeded 107-business dataset (local dev server + Docker
Postgres) confirmed correct filter/sort/attrs/openNow/empty-state behavior, then the
dev server was stopped.

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
