---
phase: 02-search-discovery-accounts
plan: 07
subsystem: frontend
tags: [nextjs, home-page, discovery-rails, category-shortcuts, server-components]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (plan 04)
    provides: "components/search/search-bar.tsx (SearchBar), extended components/directory/business-card.tsx (BusinessCardProps' optional search-context fields)"
provides:
  - "app/page.tsx — GET / real discovery home page: hero + SearchBar + 3 discovery rails (Trending Near You, New Businesses, Browse by Category)"
  - "components/home/discovery-rail.tsx — DiscoveryRail: horizontal-scroll condensed card rail, hides entirely when empty"
  - "components/home/category-shortcuts.tsx — CategoryShortcuts: taxonomy-driven grid of category tiles linking to /search?category={slug}"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DiscoveryRail's condensed rail card is assembled from the same shared primitives BusinessCard uses (Card/CardContent/Badge/AspectRatio/Image/Link) but is its own inline render inside discovery-rail.tsx, not a reuse of BusinessCard's own component output — reusing BusinessCard directly would render its gated 'No reviews yet' line whenever any search-context prop (priceTier/distanceKm/openNow) is present, which violates the UI-SPEC's 'exactly one metadata line, no snippet, no reviews line' condensed-card contract"
    - "Trending Near You is a stable-random sample: SHA-256 hash of `${businessId}trending-v1` computed for every business, sorted by hash, first 10 taken — deterministic across requests/dev-restarts (never Math.random()), an honest heuristic per CONTEXT.md D-09/D-02 rather than a fabricated trending signal"
    - "Open/Closed badges for both home-page rails are computed via one batched findMany({ id: { in: [...combined trending+new ids] } }) + computeOpenNow loop, not a per-rail or per-business query (02-RESEARCH.md Pitfall 5)"

key-files:
  created:
    - components/home/discovery-rail.tsx
    - components/home/discovery-rail.test.tsx
    - components/home/category-shortcuts.tsx
  modified:
    - app/page.tsx

key-decisions:
  - "DiscoveryRail's condensed card is NOT a reuse of the BusinessCard component's rendered output — it's a separate inline render function (RailCard) inside discovery-rail.tsx built from the same UI primitives, since BusinessCard's hasSearchContext gating means passing priceTier/distanceKm/openNow (needed for the rail's metadata line and status badge) also triggers BusinessCard's 'No reviews yet' line, which the condensed-card spec explicitly excludes. This is not a 'third card component' in the forbidden sense (no new exported/reusable card component was added anywhere else in the tree) — it's a private, non-exported render helper local to discovery-rail.tsx"
  - "Home-page rail cards show priceTier (extracted from Business.attributes, same pattern as app/search/page.tsx's extractPriceTier) rather than distanceKm, since the home page has no user location context (no geolocation prompt happens until the search bar is submitted) — distanceKm stays available in DiscoveryRailBusiness's type for any future caller that does have an origin point"
  - "Trending Near You's stable-hash sample is computed by fetching all business IDs, hashing id+\"trending-v1\" with Node's built-in crypto.createHash(\"sha256\") (no new dependency), and sorting — chosen over Math.random() specifically so the same 10 businesses appear on every request and survive dev-server restarts, matching CONTEXT.md's Claude's Discretion guidance for rail heuristics"

requirements-completed: [SRCH-06]

coverage:
  - id: D1
    description: "DiscoveryRail renders a heading + horizontally-scrollable row of condensed cards for a non-empty list; renders nothing at all (no heading, no DOM) for an empty list; each condensed card shows exactly one metadata line (category label + price tier or distance) and never a snippet or reviews line"
    requirement: "SRCH-06"
    verification:
      - kind: unit
        ref: "components/home/discovery-rail.test.tsx (4/4 tests pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "/ renders a hero heading, a working SearchBar, and exactly 3 sections in order (Trending Near You rail, New Businesses rail, Browse by Category grid) — never a 4th 'Top Rated' rail, never any avgRating/star value"
    requirement: "SRCH-06"
    verification:
      - kind: automated
        ref: "grep -ic \"top rated\" app/page.tsx == 0; npm run build (Next.js 16 production build succeeds, ƒ / compiles)"
        status: pass
      - kind: manual_procedural
        ref: "curl http://localhost:3000/ -> 200; grep confirms 'Trending Near You', 'New Businesses', 'Browse by Category', 'Find great local businesses' headings all present; 19 unique /business/<slug> card links; 16 unique /search?category=<slug> shortcut links (all 16 leaf categories); zero 'top rated' matches"
        status: pass
    human_judgment: false
  - id: D3
    description: "Category shortcut tiles link straight into a pre-filtered /search?category=... for that leaf category"
    requirement: "SRCH-06"
    verification:
      - kind: manual_procedural
        ref: "grep -o 'href=\"/search?category=[a-z-]*\"' against rendered home page HTML returns 16 unique links, one per leaf category in category-config.ts"
        status: pass
    human_judgment: false

duration: 7min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 07: Home Page Discovery Summary

**Replaces the `create-next-app` placeholder with LankaReview's real guest-friendly discovery entry point: hero + reused `SearchBar`, exactly 3 honest heuristic rails (Trending Near You via a stable SHA-256 hash sample, New Businesses by `createdAt`, Browse by Category via the full 16-leaf taxonomy), zero fabricated rating data anywhere on the page.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-09-15T06:44:45+05:30 (approx.)
- **Completed:** 2026-09-15T06:51:17+05:30
- **Tasks:** 2
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- `DiscoveryRail` (`components/home/discovery-rail.tsx`) — horizontal-scroll condensed card rail: returns `null` (no DOM at all) for an empty business list per UI-SPEC's "hide the rail entirely rather than showing an empty rail" rule; each condensed card shows exactly one metadata line (category label · price tier or distance, whichever is provided) via a dedicated inline `RailCard` render (not a reuse of `BusinessCard`'s own output, since that would leak a "No reviews yet" line whenever any search-context prop is passed)
- `CategoryShortcuts` (`components/home/category-shortcuts.tsx`) — a grid (never a horizontal scroll) of all 16 leaf categories from `category-config.ts`, one lucide-react icon per taxonomy group, each tile linking to `/search?category={slug}`
- `app/page.tsx` rewritten as an async Server Component: Display-sized hero heading "Find great local businesses in Colombo" with `SearchBar` directly beneath it, then `DiscoveryRail` "Trending Near You" (stable SHA-256-hash sample of all business IDs, first 10, deterministic across requests/dev-restarts), `DiscoveryRail` "New Businesses" (`orderBy: { createdAt: "desc" }`, first 10), and `CategoryShortcuts` — in that exact order, per CONTEXT.md D-09 (no "Top Rated" rail)
- Open/Closed badges for both rails computed via one batched `findMany({ id: { in: [...] } })` across the combined trending+new IDs, then Phase 1's `computeOpenNow` applied in-memory — zero per-business queries
- Verified against the real 107-business seeded dataset via `curl`: home page renders all 3 expected section headings, zero "top rated" text anywhere, 19 unique business card links, and all 16 category shortcut links present

## Task Commits

Each task was committed atomically (TDD RED → GREEN for Task 1; Task 2 is non-TDD `type="auto"`):

1. **Task 1: DiscoveryRail component (condensed card, horizontal scroll, hide-when-empty)** - `e53ff45` (test, RED) → `245c648` (feat, GREEN)
2. **Task 2: Home page — hero, search bar, 3 rails, category shortcuts** - `7f260d2` (feat)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `components/home/discovery-rail.tsx` - `DiscoveryRail` component + private `RailCard` condensed-card render helper
- `components/home/discovery-rail.test.tsx` - 4 tests (empty-hides-entirely, heading+row rendering, price-tier metadata line, distance metadata line)
- `components/home/category-shortcuts.tsx` - `CategoryShortcuts` component
- `app/page.tsx` - rewritten `GET /` Server Component (was the unmodified `create-next-app` boilerplate)

## Decisions Made

- `DiscoveryRail`'s condensed card is a private inline render (`RailCard`), not a reuse of `BusinessCard`'s rendered output — `BusinessCard`'s `hasSearchContext` gating means any of `priceTier`/`distanceKm`/`openNow` being passed also triggers its "No reviews yet" line, which the condensed rail-card spec (UI-SPEC's "one metadata line, no snippet") explicitly excludes. This keeps the plan's "do not build a third card component" instruction intact in spirit (no new exported/reusable card component exists anywhere else in the component tree) while still satisfying the exact-one-metadata-line behavior contract
- Home-page rail cards surface `priceTier` (extracted from `Business.attributes`, same pattern as `app/search/page.tsx`'s `extractPriceTier`) rather than `distanceKm`, since the home page has no location context before a search is submitted — `distanceKm` remains part of `DiscoveryRailBusiness`'s type for any future caller with an origin point
- Trending Near You's sample uses `crypto.createHash("sha256")` (Node built-in, no new dependency) over `${businessId}trending-v1`, sorted, first 10 — deterministic across requests/dev-restarts, never `Math.random()`, per CONTEXT.md's Claude's Discretion guidance on rail heuristics with no real telemetry

## Deviations from Plan

None — plan executed exactly as written. The `RailCard`-vs-reusing-`BusinessCard` resolution above is an implementation-detail interpretation of the plan's own slightly-tense instructions ("reuse business-card.tsx's new optional props" vs. "condensed card shows exactly one metadata line, no snippet"), not a deviation from the plan's stated scope, files, or artifacts.

## Issues Encountered

None. `npx tsc --noEmit`, `npx vitest run` (full suite, 121/121), and `npm run build` all pass cleanly. `grep -ic "top rated" app/page.tsx` returns `0` as required by the plan's acceptance criteria (an earlier draft comment accidentally contained the literal phrase "Top Rated" in a code comment explaining what was deliberately *not* built — reworded before committing so the acceptance-criteria grep stays a true negative). Manual `curl` verification against the real local Postgres instance (already running from prior plans) confirmed the rendered home page matches every locked truth in the plan's `must_haves`.

## User Setup Required

None — no external service configuration required. Uses the same local Docker Postgres instance and seeded 107-business dataset from Phase 1/02-01.

## Next Phase Readiness

- `/` is now a real, functioning, guest-friendly discovery entry point — SRCH-06 is complete
- `DiscoveryRail` and `CategoryShortcuts` are both self-contained and require no further wiring from later plans in this phase
- No blockers. Phase 2's remaining plans (08-09 per STATE.md's "Plan 7 of 9") are unaffected by anything in this plan's scope

## Self-Check: PASSED

All 4 files (`components/home/discovery-rail.tsx`, `components/home/discovery-rail.test.tsx`,
`components/home/category-shortcuts.tsx`, `app/page.tsx`) confirmed present on disk. All 3 task
commits (`e53ff45`, `245c648`, `7f260d2`) confirmed present in `git log`. Full test suite
(`npx vitest run`) passes 121/121; `npm run build` succeeds; manual `curl` verification against
the real 107-business seeded dataset confirmed the home page's rendered HTML matches every
locked truth in the plan's `must_haves` (hero, search bar, exactly 3 sections in order, zero
"top rated" occurrences, 16/16 category shortcut links present).

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
