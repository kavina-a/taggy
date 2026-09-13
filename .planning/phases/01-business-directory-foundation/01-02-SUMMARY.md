---
phase: 01-business-directory-foundation
plan: 02
subsystem: hours-and-open-now
tags: [luxon, zod, vitest, playwright, prisma, shadcn-accordion]

# Dependency graph
requires: ["01-01"]
provides:
  - "lib/hours/compute-open-now.ts — computeOpenNow(hours, overrides, nowInput?): boolean, Asia/Colombo timezone-aware, checks both today's and yesterday's rows for overnight-shift/holiday-override correctness"
  - "lib/hours/hours.schema.ts — hoursRowSchema/hoursOverrideRowSchema (Zod), reused by lib/validation/business.schema.ts's seed-time validation"
  - "components/business/hours-accordion.tsx — HoursAccordion, a 7-day hours accordion (collapsed by default) with an Open now/Closed status badge"
  - "Live business page now computes and displays a real, server-side open/closed badge and full hours for every seeded business"
affects: [01-03-attributes-photos-menu, 01-04-full-seed-dataset]

# Tech tracking
tech-stack:
  added: ["@types/luxon@3.7.5"]
  patterns:
    - "Server-side-only time computation: computeOpenNow always runs in app/business/[slug]/page.tsx (Server Component) with an explicit Asia/Colombo DateTime; the client component (HoursAccordion) only ever renders the boolean it's given, never recomputes from new Date()"
    - "Seed-time nested-relation idempotency: prisma/seed.ts now deletes then re-creates a business's BusinessHours/BusinessHoursOverride rows on every upsert, so re-running the seed script never duplicates hours rows"

key-files:
  created:
    - lib/hours/compute-open-now.ts
    - lib/hours/compute-open-now.test.ts
    - lib/hours/hours.schema.ts
    - components/business/hours-accordion.tsx
    - components/ui/accordion.tsx
  modified:
    - app/business/[slug]/page.tsx
    - components/business/business-page.tsx
    - components/business/business-page.test.tsx
    - e2e/directory-to-business.spec.ts
    - lib/validation/business.schema.ts
    - prisma/seed.ts
    - prisma/seed-data/businesses.json
    - package.json
    - package-lock.json

key-decisions:
  - "Extended businessSeedSchema (.strict()) with hours/hoursOverrides array fields validated via hoursRowSchema/hoursOverrideRowSchema, since the schema's strict mode would otherwise reject the new seed-data keys — implements threat T-02-01 exactly as specified in the plan's threat model"
  - "Removed the inline Open now/Closed badge that 01-01 placed in the page header (only rendered for a non-null openNow) in favor of a single badge inside HoursAccordion, positioned in the new Hours section below Address, avoiding a duplicate badge once openNow became a real boolean"
  - "Used Ministry of Crab's Friday dinner shift (18:30-02:00, crossesMidnight: true) as the one seeded midnight-crossing example, and Upali's by Nawaloka's Dec-25 override as the one seeded holiday-closure example, rather than inventing a new bar/nightlife category not yet in the taxonomy"

patterns-established:
  - "Hours/open-now algorithm (lib/hours/compute-open-now.ts) checks [yesterday, today] and treats an override as fully authoritative for its date (never falls through to regular weekly hours) — reuse this shape for any future date-scoped exception logic"

requirements-completed: [LIST-02]

coverage:
  - id: D1
    description: "computeOpenNow correctly resolves a same-day (non-midnight-crossing) shift, both open and closed cases"
    requirement: "LIST-02"
    verification:
      - kind: unit
        ref: "lib/hours/compute-open-now.test.ts#is open during a same-day (no midnight crossing) Tuesday shift; #is closed after a same-day Tuesday shift's close time"
        status: pass
    human_judgment: false
  - id: D2
    description: "computeOpenNow correctly resolves a midnight-crossing shift both while still open after midnight and once truly closed"
    requirement: "LIST-02"
    verification:
      - kind: unit
        ref: "lib/hours/compute-open-now.test.ts#is still open just after midnight for a Monday shift that crosses into Tuesday; #is closed once a midnight-crossing Monday shift's 02:00 close has passed"
        status: pass
    human_judgment: false
  - id: D3
    description: "A holiday override on today's date with isClosed:true overrides otherwise-open regular hours"
    requirement: "LIST-02"
    verification:
      - kind: unit
        ref: "lib/hours/compute-open-now.test.ts#is closed when today has a holiday override with isClosed even though regular hours say open"
        status: pass
    human_judgment: false
  - id: D4
    description: "A holiday override on yesterday's date that crosses midnight into today is still honored, even though today's own regular hours say closed"
    requirement: "LIST-02"
    verification:
      - kind: unit
        ref: "lib/hours/compute-open-now.test.ts#is open when yesterday's override shift crosses midnight into today, even though today's own regular hours say closed"
        status: pass
    human_judgment: false
  - id: D5
    description: "A business page shows its full 7-day hours (grouped split shifts) and a real Open now/Closed badge computed server-side"
    requirement: "LIST-02"
    verification:
      - kind: unit
        ref: "components/business/business-page.test.tsx#shows \"Open now\" when openNow is true; #shows \"Closed\" when openNow is false"
        status: pass
      - kind: e2e
        ref: "e2e/directory-to-business.spec.ts#directory to business page click-through (Open now|Closed badge assertion)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Re-running the seed script after adding hours/hoursOverrides stays idempotent (no duplicate BusinessHours rows)"
    requirement: "LIST-02"
    verification:
      - kind: integration
        ref: "npx tsx prisma/seed.ts && npx tsx prisma/seed.ts (both exit 0, 95 BusinessHours rows and 1 BusinessHoursOverride row both times, confirmed via psql GROUP BY businessId)"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-09-13
status: complete
---

# Phase 1 Plan 02: Hours & Open Now Summary

**Test-first `computeOpenNow` (Luxon, Asia/Colombo) proven against the overnight-shift and holiday-override edge cases, wired into a live 7-day hours accordion + status badge on every seeded business page.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-09-13T21:54:00+05:30 (approx.)
- **Completed:** 2026-09-13T22:05:34+05:30
- **Tasks:** 3
- **Files modified:** 16 (5 created, 9 modified, 2 lockfile/manifest)

## Accomplishments
- `computeOpenNow` written test-first: 7 passing unit tests cover a same-day shift (open/closed), a Monday 18:00-02:00 shift still open at 00:30 Tuesday and closed by 03:00, a today-dated holiday closure overriding otherwise-open regular hours, a yesterday-dated override shift crossing into today despite today's own regular hours saying closed, and the no-hours/no-override closed case
- `HoursAccordion` renders the status badge (green "Open now" / neutral-gray "Closed", never red) plus a collapsed-by-default 7-day accordion with same-day split shifts grouped onto one comma-separated line, a 44px tap target, and a dynamic "Expand hours"/"Collapse hours" aria-label
- The live business page now computes `openNow` server-side with an explicit `Asia/Colombo` Luxon zone and renders real hours/badge for every one of the 13 seeded businesses
- All 13 seed businesses got a realistic 7-day hours array; Ministry of Crab's Friday dinner shift crosses midnight (18:30-02:00) and Upali's by Nawaloka carries a Dec-25 holiday-closure override, covering both of RESEARCH.md's flagged pitfall cases in real seed data
- Seed script re-run twice with no duplicate hours rows (95 `BusinessHours` rows, 1 `BusinessHoursOverride` row, stable across both runs)

## Task Commits

Each task was committed atomically:

1. **Task 1 [RED-GREEN]: Test-first computeOpenNow covering overnight and holiday-override cases** - `bd16cd0` (test, RED→GREEN in one commit: test file authored and confirmed failing before `compute-open-now.ts` existed, then implemented and verified passing)
2. **Task 2: Hours accordion UI component** - `b7d4456` (feat)
3. **Task 3: Wire hours + open-now into the live business page, extend seed data** - `55a741e` (feat)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `lib/hours/compute-open-now.ts` - `computeOpenNow(hours, overrides, nowInput?)`, Asia/Colombo-aware, checks yesterday+today
- `lib/hours/compute-open-now.test.ts` - 7 tests covering the plan's `<behavior>` block exactly
- `lib/hours/hours.schema.ts` - `hoursRowSchema`/`hoursOverrideRowSchema` (Zod, regex `HH:mm`, bounded `dayOfWeek`)
- `components/business/hours-accordion.tsx` - `HoursAccordion` (status badge + collapsed 7-day accordion)
- `components/ui/accordion.tsx` - shadcn-generated accordion primitive (Vega preset)
- `app/business/[slug]/page.tsx` - calls `computeOpenNow` server-side, passes a real boolean (no more `null` placeholder)
- `components/business/business-page.tsx` - renders `HoursAccordion` in a new "Hours" section below Address; removed the now-redundant inline header badge
- `components/business/business-page.test.tsx` - added `openNow: true`/`false` badge-visibility cases
- `e2e/directory-to-business.spec.ts` - asserts `/Open now|Closed/` is visible on the business page
- `lib/validation/business.schema.ts` - extended with `hours`/`hoursOverrides` array fields (T-02-01)
- `prisma/seed.ts` - upserts hours/hoursOverrides as delete-then-create nested relations (idempotent)
- `prisma/seed-data/businesses.json` - added realistic 7-day hours to all 13 businesses, one midnight-crossing shift, one holiday override
- `package.json` / `package-lock.json` - added `@types/luxon@3.7.5` dev dependency

## Decisions Made

- Extended `businessSeedSchema` (`.strict()`) with `hours`/`hoursOverrides` fields validated via `hoursRowSchema`/`hoursOverrideRowSchema` rather than validating them separately outside the schema — keeps a single validation boundary and directly implements threat T-02-01 from the plan's threat model
- Removed 01-01's inline header badge (which only rendered for a non-null `openNow`) once `openNow` became a real boolean, so the status is shown exactly once, inside `HoursAccordion`, in the new "Hours" section per UI-SPEC's locked section order (header, hours, attributes, gallery, menu)
- Made `HoursAccordion`'s aria-label dynamic ("Expand hours" when collapsed, "Collapse hours" when open) rather than a single static label, since the plan's `<action>` text names both variants explicitly
- Used Ministry of Crab (an existing seeded restaurant with `alcoholServed: true`) for the one midnight-crossing seed example (Friday 18:30-02:00 dinner+bar) instead of introducing a new bar/nightlife business outside the current category taxonomy, since LIST-05's full taxonomy work is scoped to a later plan (01-03/01-05)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing `@types/luxon` dev dependency**
- **Found during:** Task 1, first `npx tsc --noEmit` after implementing `compute-open-now.ts`
- **Issue:** `luxon` ships untyped; `tsc` failed with "Could not find a declaration file for module 'luxon'" in both the test file and the implementation
- **Fix:** Verified `@types/luxon` on the live npm registry (official `DefinitelyTyped/DefinitelyTyped` repo, current version 3.7.5) before installing — not a blind "similar package" substitution, so outside the package-install checkpoint's slopsquatting concern
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npx tsc --noEmit -p tsconfig.json` passes clean
- **Committed in:** `bd16cd0`

**2. [Rule 3 - Blocking] Re-hit and re-fixed the npm optional-dependency rollup bug from 01-01**
- **Found during:** Task 1, immediately after installing `@types/luxon`
- **Issue:** The same documented npm bug (npm/cli#4828) 01-01 already hit reappeared: `npx vitest run` failed with `Cannot find module '@rollup/rollup-darwin-arm64'` after the `npm install -D @types/luxon` run
- **Fix:** Removed `node_modules` **and** `package-lock.json`, then ran a full clean `npm install` (a partial `node_modules`-only removal was not sufficient this time — the lockfile itself needed regenerating)
- **Files modified:** `package-lock.json` (regenerated)
- **Verification:** `npx vitest run` and `npx tsc --noEmit` both execute without module-resolution errors
- **Committed in:** `bd16cd0`

**3. [Rule 3 - Blocking] Extended `businessSeedSchema` to accept `hours`/`hoursOverrides` (not in Task 3's original `<files>` list)**
- **Found during:** Task 3, before writing seed data
- **Issue:** `businessSeedSchema` is `.strict()`; adding `hours`/`hoursOverrides` keys to `businesses.json` would have made every `businessSeedSchema.parse(raw)` call throw "unrecognized key" once the seed script ran, since those fields weren't in the schema
- **Fix:** Added `hours: z.array(hoursRowSchema).default([])` and `hoursOverrides: z.array(hoursOverrideRowSchema).default([])` to `businessSeedSchema`, reusing Task 1's schemas — this is also literally what threat T-02-01 in the plan's own threat model calls for
- **Files modified:** `lib/validation/business.schema.ts`
- **Verification:** `npx tsx prisma/seed.ts` (twice) succeeds; existing `lib/validation/business.schema.test.ts` still passes unmodified (new fields default to `[]`)
- **Committed in:** `55a741e`

---

**Total deviations:** 3 auto-fixed (all Rule 3 - blocking)
**Impact on plan:** All three were reactions to either an already-documented environment quirk (the npm rollup bug, same root cause 01-01 hit) or a necessary consequence of the plan's own locked interface (`businessSeedSchema`'s `.strict()` mode meeting new seed-data fields the plan itself required). No architectural changes, no scope creep.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

None. `docker compose up -d db` was already running from 01-01; no new external service configuration required.

## Next Phase Readiness

- `lib/hours/compute-open-now.ts` and `HoursAccordion` are stable, reusable building blocks — 01-03 (attributes/photos/menu) and 01-04 (full seed dataset) can extend `businesses.json` with more hours rows using the same shape without touching the algorithm
- `businessSeedSchema` now validates hours/overrides, so any future seed-data expansion in 01-04 automatically gets the same T-02-01 protection
- No blockers.

## Self-Check: PASSED

All 5 created files (lib/hours/compute-open-now.ts, lib/hours/compute-open-now.test.ts,
lib/hours/hours.schema.ts, components/business/hours-accordion.tsx,
components/ui/accordion.tsx) confirmed present on disk. All 3 task commits (bd16cd0,
b7d4456, 55a741e) confirmed present in `git log`.

---
*Phase: 01-business-directory-foundation*
*Completed: 2026-09-13*
