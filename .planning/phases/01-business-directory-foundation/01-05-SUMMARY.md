---
phase: 01-business-directory-foundation
plan: 05
subsystem: ui
tags: [react, next.js, shadcn, zod, vitest]

# Dependency graph
requires:
  - phase: 01-business-directory-foundation (plans 01, 03)
    provides: BusinessDetail.secondaryCategories (fetched/typed/seeded, never rendered) and the categoryTaxonomy config consumed here
provides:
  - Secondary-category badge rendering on the business profile page (variant="outline", distinct from primary badges)
  - lib/categories/category-config.ts#getCategoryLabel(slug) — shared slug-to-label lookup
  - Directory > Category > Business Name breadcrumb on the business profile page using the shadcn breadcrumb primitive
affects: [phase-2-search-accounts, phase-3-reviews]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Secondary/derived badge groups use variant=\"outline\" to visually distinguish from primary variant=\"secondary\" badges (matches attribute-badges.tsx convention)"
    - "Non-interactive breadcrumb segments (no filter route yet) are rendered as plain BreadcrumbItem text rather than BreadcrumbLink, to avoid inventing out-of-scope filtering routes"

key-files:
  created: []
  modified:
    - components/business/business-page.tsx
    - components/business/business-page.test.tsx
    - lib/categories/category-config.ts

key-decisions:
  - "Included the breadcrumb (non-blocking WARNING) rather than deferring it, since it is a small, presentational, same-file addition using only existing static taxonomy data — no new route or filtering behavior."
  - "Category segment in the breadcrumb is plain text, not a link, because Phase 1's directory route has no category-filter query param and CONTEXT.md explicitly excludes search/filtering from this phase."

patterns-established:
  - "Pattern: getCategoryLabel(slug) as the single shared slug->label lookup, replacing the need for per-file local CATEGORY_LOOKUP duplication going forward."

requirements-completed: [LIST-01]

coverage:
  - id: D1
    description: "Business profile page renders business.secondaryCategories as a visually distinct badge group (variant=\"outline\") below the primary category badges"
    requirement: "LIST-01"
    verification:
      - kind: unit
        ref: "components/business/business-page.test.tsx#renders secondary categories as a distinct badge group"
        status: pass
    human_judgment: false
  - id: D2
    description: "Directory > Category > Business Name breadcrumb wired into the business profile page using the shadcn breadcrumb primitive"
    verification:
      - kind: unit
        ref: "components/business/business-page.test.tsx#renders a Directory > Category > Business Name breadcrumb"
        status: pass
    human_judgment: false

# Metrics
duration: 15min
completed: 2026-09-13
status: complete
---

# Phase 1 Plan 05: Secondary Categories + Breadcrumb Gap Closure Summary

**Closed the one BLOCKING gap from 01-VERIFICATION.md — secondary categories were fetched and seeded but never rendered — and wired the previously-unused shadcn breadcrumb primitive into the business profile page.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2 completed
- **Files modified:** 3

## Accomplishments
- `components/business/business-page.tsx` now renders `business.secondaryCategories` as an "Also listed under" badge group with `variant="outline"`, visually distinct from the primary categories' `variant="secondary"` badges — closing the last gap in LIST-01 and ROADMAP Success Criterion #1.
- Added `getCategoryLabel(slug)` to `lib/categories/category-config.ts`, the first shared slug-to-human-label lookup outside `app/directory/page.tsx`'s local copy.
- Wired a `Directory > Category > Business Name` breadcrumb (shadcn `Breadcrumb` primitives) above the page header, with the category segment as plain text (no invented filter route).
- Test mock's `secondaryCategories` changed from `[]` to a realistic non-empty array (`["beauty-spa", "grocery-convenience"]`), and two new test cases were added (secondary-category badges, breadcrumb trail). Full suite: 5 files, 32/32 tests pass, no regressions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Render secondaryCategories as a distinct badge group** - `442423a` (fix)
2. **Task 2: Wire the shadcn breadcrumb into the business page** - `1de451d` (feat)

_Note: no TDD tasks in this plan; each task was implementation + accompanying test update in one commit, per the plan's task-level acceptance criteria._

## Files Created/Modified
- `components/business/business-page.tsx` - Renders secondary-category badges and a Directory > Category > Business Name breadcrumb
- `components/business/business-page.test.tsx` - Non-empty `secondaryCategories` mock; new tests for secondary badges and breadcrumb
- `lib/categories/category-config.ts` - New `getCategoryLabel(slug)` export backed by a module-level `Map` built from `categoryTaxonomy`

## Decisions Made
- Included the breadcrumb in this same gap-closure plan rather than deferring it further, per the plan's own "if it's a small addition, include it" guidance — it reuses only existing static taxonomy data and touches the same file already being modified for the blocking fix.
- Category breadcrumb segment renders as plain text (not a link) since Phase 1 has no category-filtered directory route; adding one would expand scope into Phase 2's search/filtering boundary.
- Secondary-category badges render the raw category slug string (matching the existing primary-category badge convention), not a human-readable label — kept out of scope per the plan's explicit instruction, since that's a separate, already-verified question.

## Deviations from Plan

None - plan executed exactly as written. Both tasks' acceptance criteria (grep checks + `npx vitest run components/business/business-page.test.tsx`) passed on first implementation with no rework needed.

## Issues Encountered

None.

## Verification

- `npx vitest run components/business/business-page.test.tsx` — 9/9 tests pass (7 original + 2 new).
- `npx vitest run` (full suite) — 5 files, 32/32 tests pass, no regressions to the other 4 test files.
- `npx tsc --noEmit` — no type errors.
- `grep -c "secondaryCategories.map" components/business/business-page.tsx` → 1 (>= 1 required).
- `grep -c "<Breadcrumb" components/business/business-page.tsx` → 1 (>= 1 required, plus nested Breadcrumb* usages).
- `grep -c "export function getCategoryLabel" lib/categories/category-config.ts` → 1 (== 1 required).
- Re-read 01-VERIFICATION.md's gap entry (lines 9-30): both `missing:` items (render secondaryCategories; add a component test with non-empty mock) are now addressed.

## Next Steps

LIST-01 is now fully SATISFIED — Phase 1's remaining verification score should move from 4/5 to 5/5 must-haves on re-verification. No further gap-closure plans are anticipated for Phase 1; the phase is ready to be re-verified and, if clean, advance to Phase 2 (Search + Accounts).

## Self-Check: PASSED
