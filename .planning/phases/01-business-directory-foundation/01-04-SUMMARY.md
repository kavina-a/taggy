---
phase: 01-business-directory-foundation
plan: 04
subsystem: database
tags: [prisma, zod, nextjs, seed-data, pagination, category-taxonomy]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Prisma schema, businessSeedSchema, seed pipeline, directory index + business page skeleton"
  - phase: 01-02
    provides: "hours/hoursOverrides Zod validation, idempotent nested-relation seeding pattern"
  - phase: 01-03
    provides: "Full 16-leaf-category categoryTaxonomy + attributeSchemaByCategory, AttributeBadges (data-testid=attribute-badge), PhotoGallery"
provides:
  - "prisma/seed-data/businesses.json expanded to 107 real, hand-curated Colombo businesses spanning all 16 leaf categories (restaurant largest at 20, every other leaf >= 5)"
  - "prisma/seed.ts rewritten: single pre-write validation pass (schema + per-category attributes + slug-uniqueness) that fails fast with zero writes on any bad record, entire upsert run wrapped in one prisma.$transaction"
  - "prisma/scripts/count-businesses.ts — standalone business-count script used to prove idempotency"
  - "app/directory/page.tsx — category-grouped, paginated (24/page, server-controlled) directory index matching UI-SPEC Screen 1"
  - "components/directory/business-card.tsx — final version with photo/category-label/district and 'Image unavailable' fallback"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seed script fail-fast pre-write validation: validateAll() parses/validates every record (businessSeedSchema, category attribute schema, slug Set) before any DB write, throwing one aggregated error listing every bad record's index/slug — never partially seeds on bad data (T-04-01, T-04-03)"
    - "Single-transaction seeding: prisma.$transaction wraps the whole upsert + nested hours/hoursOverrides/photos delete-then-create loop, using `tx` throughout so a mid-run failure rolls back atomically"
    - "Global (not per-group) server-side pagination: one Prisma take/skip query pair (fixed PAGE_SIZE=24) drives ?page=, then the fetched page's businesses are grouped in-memory by categoryTaxonomy's groupSlug for section rendering — the client only ever controls the page number (T-04-02)"

key-files:
  created:
    - prisma/scripts/count-businesses.ts
  modified:
    - prisma/seed-data/businesses.json
    - prisma/seed.ts
    - app/directory/page.tsx
    - components/directory/business-card.tsx
    - e2e/directory-to-business.spec.ts

key-decisions:
  - "Distributed the 94 new businesses across all 16 leaf categories (target counts per category chosen so restaurant remains the largest single group at 20, every other leaf category has >= 5) rather than an even split, per CONTEXT.md D-04's 'don't cluster in one vertical, but keep restaurants primary' guidance"
  - "Implemented pagination as one global take/skip query over the full name-sorted business list (not a separate paginated query per category group) — matches the plan's literal 'take/skip Prisma query pair driven by a ?page= param' instruction and keeps T-04-02's DoS mitigation a single, auditable query"
  - "An out-of-range ?page= value (e.g. page=999) is not clamped to the last valid page — it naturally returns zero businesses for that page and renders the existing 'No businesses found' empty state, satisfying T-04-04 (invalid input degrades gracefully, never throws) without adding separate out-of-range handling logic"
  - "Directory index include:{photos:{take:1}} rather than fetching all photos per business — only the first photo (by sortOrder) is needed for the card grid, keeping the paginated query lightweight at 107+ rows"

patterns-established:
  - "Seed dataset generation via a throwaway Node script (not checked into the repo) that hand-authors business name/description/location/attributes per entry but mechanically derives slug/hours-template/photo-array — a reusable approach for any future large hand-curated dataset expansion"

requirements-completed: [LIST-05, LIST-06]

coverage:
  - id: D1
    description: "The seed dataset contains >= 100 real, well-known Colombo businesses spanning all 16 leaf categories, each with >= 3 entries"
    requirement: "LIST-06"
    verification:
      - kind: automated_ui
        ref: "jq 'length' prisma/seed-data/businesses.json == 107; jq -r '[.[].slug] | unique | length' == 107 (no duplicates)"
        status: pass
      - kind: unit
        ref: "validate-seed-scratch.mts (ad hoc): every record parses cleanly against businessSeedSchema and its category's attributeSchemaByCategory schema"
        status: pass
    human_judgment: false
  - id: D2
    description: "Seed script is transactional and provably idempotent: two consecutive runs produce an identical business count, and a deliberately invalid record (duplicate slug) fails the whole run with zero partial writes"
    requirement: "LIST-06"
    verification:
      - kind: integration
        ref: "npx tsx prisma/seed.ts && npx tsx prisma/scripts/count-businesses.ts (107) && npx tsx prisma/seed.ts && npx tsx prisma/scripts/count-businesses.ts (107, unchanged)"
        status: pass
      - kind: integration
        ref: "manual: injected a duplicate-slug record, ran npx tsx prisma/seed.ts — failed with 'Seed validation failed' before any write, count stayed at 107"
        status: pass
    human_judgment: false
  - id: D3
    description: "The directory index groups businesses by top-level category (per LIST-05 taxonomy) with visible group headings, not a flat list, and uses fixed server-side pagination"
    requirement: "LIST-05"
    verification:
      - kind: e2e
        ref: "e2e/directory-to-business.spec.ts#directory to business page click-through (asserts a level-2 category-group heading is visible before clicking through)"
        status: pass
      - kind: manual_procedural
        ref: "curl http://localhost:3000/directory (Page 1 of 5, 8 category-group headings, 24 cards) and ?page=2/?page=abc/?page=999 — pagination, invalid-input fallback, and empty state all confirmed"
        status: pass
    human_judgment: false
  - id: D4
    description: "Full phase e2e smoke path (directory -> business page -> open/closed badge -> attribute badge) passes against the complete 107-business seeded dataset"
    verification:
      - kind: e2e
        ref: "e2e/directory-to-business.spec.ts#directory to business page click-through"
        status: pass
      - kind: unit
        ref: "npx vitest run (30/30 tests passing across all 5 existing test files, unaffected by this plan's changes)"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-09-13
status: complete
---

# Phase 1 Plan 04: Full Seed Dataset, Transactional Idempotency & Paginated Directory Summary

**Expanded the seed dataset from 13 to 107 real, hand-curated Colombo businesses across all 16 leaf categories, rewrote `prisma/seed.ts` with fail-fast pre-write validation and a single wrapping transaction, and rebuilt `/directory` as a category-grouped, 24-per-page paginated index.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-09-13T22:20:00+05:30 (approx.)
- **Completed:** 2026-09-13T22:44:39+05:30
- **Tasks:** 3
- **Files modified:** 6 (1 created, 5 modified)

## Accomplishments
- `prisma/seed-data/businesses.json` grew from 13 to 107 real, well-known Colombo businesses: every one of the 16 leaf categories from `category-config.ts` now has at least 5 entries (7 categories — nightlife-bars, retail-shopping, grocery-convenience, health-medical, fitness-recreation, professional-services, lodging — previously had zero), with `restaurant` remaining the largest single group at 20 per PROJECT.md's primary-vertical strategy
- Every one of the 107 records was validated against `businessSeedSchema` and its category's `attributeSchemaByCategory` schema before being committed, with no duplicate slugs and all coordinates confirmed within the Colombo bounding box (6.82-6.98 N, 79.83-79.92 E)
- `prisma/seed.ts`'s `main()` now runs a `validateAll()` pre-write pass (schema parse + per-category attribute parse + slug-`Set` collision check) that throws a single aggregated error listing every bad record before any database write, then wraps the entire upsert + nested-relations loop in one `prisma.$transaction`
- Verified both idempotency (two consecutive seed runs both report 107 businesses) and atomicity (a deliberately injected duplicate-slug record failed the whole run with the business count staying at 107 — zero partial writes)
- `app/directory/page.tsx` now fetches a fixed 24-business page (via Prisma `take`/`skip` driven only by `?page=`), groups the page's businesses by `categoryTaxonomy` group for section rendering, and adds Previous/Next pagination controls; `BusinessCard` shows the business's first photo (or an "Image unavailable" fallback tile), its category *label* (not raw slug), and district
- Finalized `e2e/directory-to-business.spec.ts` to assert a category-group heading is visible, click a restaurant card (or the first available card), and assert the business page shows the name, the open/closed badge, and at least one attribute badge — passing against the full 107-business dataset

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand seed dataset to 100-300 real Colombo businesses across the full taxonomy** - `1284855` (feat)
2. **Task 2: Harden seed script — transactional, fail-fast validation, slug-collision detection, idempotency proof** - `64bba35` (feat)
3. **Task 3: Category-grouped, paginated directory index and final e2e coverage** - `a3038f7` (feat)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `prisma/seed-data/businesses.json` - expanded from 13 to 107 real Colombo businesses across all 16 leaf categories
- `prisma/seed.ts` - `validateAll()` fail-fast pre-write pass + single `prisma.$transaction` wrapping the whole upsert/nested-relations run
- `prisma/scripts/count-businesses.ts` - prints `prisma.business.count()` to stdout, exit 0
- `app/directory/page.tsx` - category-grouped, 24/page paginated directory index driven by `?page=`
- `components/directory/business-card.tsx` - photo (or fallback tile), category label, district, retains `data-primary-category`
- `e2e/directory-to-business.spec.ts` - asserts category-group heading, restaurant-card click-through, name/badge/attribute-badge on the business page

## Decisions Made

- Distributed the 94 new businesses so every leaf category has >= 5 entries and `restaurant` stays the largest group (20) — deliberate spread per CONTEXT.md D-04's discretion note, not an even 16-way split
- Implemented pagination as a single global `take`/`skip` query over the name-sorted business list, then grouped that page's results in-memory by category — matches the plan's literal "take/skip Prisma query pair driven by `?page=`" wording and keeps the DoS mitigation (T-04-02) a single auditable query rather than N per-group queries
- An out-of-range `?page=` value is not clamped to the last valid page; it naturally yields zero results for that page and reuses the existing "No businesses found" empty state — satisfies T-04-04 without new branching logic
- Directory query uses `include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } }` rather than fetching every photo per business, since the card grid only ever needs the first photo

## Deviations from Plan

None - plan executed exactly as written. The generation of seed data via a throwaway Node script (not checked into the repo) was an implementation-detail choice for reliably producing 94 schema-valid, uniquely-slugged records at this volume, not a deviation from the plan's actual deliverable (a 100+ business `businesses.json` file).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Local dev only: `docker compose up -d db && npx prisma migrate deploy && npx tsx prisma/seed.ts && npm run dev`.

## Next Phase Readiness

- Phase 1 (Business Directory Foundation) is now feature-complete: all 4 plans (01-01 through 01-04) executed, LIST-01 through LIST-06 and LOC-02 all satisfied against a real 107-business Colombo dataset
- `prisma/scripts/count-businesses.ts` is a reusable standalone verification tool any future phase can call to sanity-check seed/migration state
- The directory index's pagination pattern (fixed server-side `take`, client-controlled `page` only) is the template Phase 2's search/filter results page should follow for its own pagination
- No blockers.

## Self-Check: PASSED

`prisma/scripts/count-businesses.ts` confirmed present on disk. All 3 task commits
(1284855, 64bba35, a3038f7) confirmed present in `git log`. `prisma/seed-data/businesses.json`
confirmed at 107 entries with 107 unique slugs on disk.

---
*Phase: 01-business-directory-foundation*
*Completed: 2026-09-13*
