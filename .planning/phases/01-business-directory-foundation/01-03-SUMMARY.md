---
phase: 01-business-directory-foundation
plan: 03
subsystem: ui
tags: [zod, shadcn-tabs, shadcn-aspect-ratio, next-image, prisma, category-taxonomy]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Prisma schema (Business.attributes jsonb, BusinessPhoto), lib/types/business.ts, business-page.tsx presentational component, seed pipeline"
  - phase: 01-02
    provides: "HoursAccordion section pattern, businessSeedSchema strict validation boundary, idempotent nested-relation seeding pattern"
provides:
  - "lib/categories/category-config.ts — full 9-group/16-leaf-category taxonomy (categoryTaxonomy) plus a strict Zod attribute schema per leaf category (attributeSchemaByCategory), including all 4 Sri Lanka-specific categories"
  - "components/business/attribute-badges.tsx — AttributeBadges, category-conditional badge list, safeParse-based (never throws on stale data)"
  - "components/business/photo-gallery.tsx — PhotoGallery, lazy-loaded blur-placeholder gallery grid with a restaurant-only Menu tab (shadcn Tabs)"
  - "Live business page now renders category-correct attribute badges and a working photo gallery for every seeded business, with restaurants showing a pinned Menu tab"
  - "next.config.ts images.remotePatterns restricted to picsum.photos only"
affects: [01-04-full-seed-dataset]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Category-conditional rendering via safeParse: AttributeBadges/seed.ts look up attributeSchemaByCategory[primaryCategory] and safeParse/parse attributes against it — render layer never throws on stale/legacy data, seed layer throws to catch bad data before it reaches Postgres"
    - "Radix Tabs component testing: use fireEvent.mouseDown (not fireEvent.click) on TabsTrigger — Radix switches the active tab on mousedown/focus, not click"
    - "next/image with a shared static base64 blurDataURL for all remote (non-static-import) gallery tiles, since placeholder=\"blur\" requires an explicit blurDataURL for non-import sources"

key-files:
  created:
    - lib/categories/category-config.ts
    - lib/categories/category-config.test.ts
    - components/business/attribute-badges.tsx
    - components/business/photo-gallery.tsx
    - components/business/photo-gallery.test.tsx
    - components/ui/tabs.tsx
    - components/ui/aspect-ratio.tsx
  modified:
    - components/business/business-page.tsx
    - components/business/business-page.test.tsx
    - lib/validation/business.schema.ts
    - next.config.ts
    - prisma/seed.ts
    - prisma/seed-data/businesses.json

key-decisions:
  - "Restaurant/home-services/beauty-spa attribute schemas copied verbatim from 01-RESEARCH.md's Pattern 3 code example (field names, defaults) since the plan explicitly required matching that example"
  - "priceTier modeled as a required union of literals (1|2|3|4, no default) across every category schema that includes it, matching RESEARCH's restaurant example, rather than making it optional — seed data was written to always supply it where required"
  - "Enum attribute fields (genderSpecificServices, ageGroup, vendorType) render an AttributeBadges badge only when set to a non-default/non-generic value (skips \"none\"/\"all\"/\"other\") rather than always rendering, to avoid a badge that communicates nothing"
  - "Fixed 01-01/01-02's placeholder category slugs (cafe -> cafe-bakery, vehicle-repair -> auto-repair) and replaced generic home-services-shaped attributes on auto-repair/tuk-repair/tutoring/wedding-vendors/tailoring businesses with their real category-specific attribute shapes, per the plan's explicit Task 3 instruction"

patterns-established:
  - "Static per-category Zod attribute config (lib/categories/category-config.ts) is now the single source of truth for both attribute-badge rendering and seed-time validation — any future phase adding a category must add both a categoryTaxonomy entry and an attributeSchemaByCategory entry, enforced by category-config.test.ts's orphan check"

requirements-completed: [LIST-03, LIST-04, LIST-05]

coverage:
  - id: D1
    description: "Full 16-leaf-category taxonomy (9 groups) defined, including all 4 Sri Lanka-specific categories (tuk-repair, tutoring, wedding-vendors, tailoring), each with a strict Zod attribute schema"
    requirement: "LIST-05"
    verification:
      - kind: unit
        ref: "lib/categories/category-config.test.ts#includes all 4 Sri Lanka-specific leaf slugs somewhere in categoryTaxonomy; #has a matching attributeSchemaByCategory entry for every leaf slug (no orphans)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Category attribute jsonb is validated against the correct per-category Zod schema, rejecting unknown keys and out-of-range values"
    requirement: "LIST-03"
    verification:
      - kind: unit
        ref: "lib/categories/category-config.test.ts#restaurant schema accepts a fully valid restaurant attribute set; #restaurant schema rejects an out-of-range priceTier; #home-services schema accepts a minimal valid attribute set; #tuk-repair schema rejects unknown keys (strict)"
        status: pass
    human_judgment: false
  - id: D3
    description: "A visitor viewing a business page sees attribute badges relevant to that business's category, rendered via safeParse (never throws on stale data)"
    requirement: "LIST-03"
    verification:
      - kind: unit
        ref: "components/business/business-page.test.tsx#renders at least one attribute badge for a business with valid attributes"
        status: pass
      - kind: manual_procedural
        ref: "curl http://localhost:3411/business/ministry-of-crab and /business/cafe-kumbuk — both show category-correct attribute badges (Dine-in/Alcohol Served/$$$$ vs Wifi/Outdoor Seating/Takeout/$$)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A visitor can browse a photo gallery on any business page, with a clear 'No photos yet' empty state when there are no photos"
    requirement: "LIST-04"
    verification:
      - kind: unit
        ref: "components/business/photo-gallery.test.tsx#renders the \"No photos yet\" empty state when given no photos"
        status: pass
      - kind: unit
        ref: "components/business/business-page.test.tsx#renders the photo gallery section"
        status: pass
    human_judgment: false
  - id: D5
    description: "A visitor viewing a restaurant's page sees a dedicated Menu tab of pinned menu photos, separate from the general gallery; non-restaurant pages never show a Menu tab even with isMenuPhoto photos present"
    requirement: "LIST-04"
    verification:
      - kind: unit
        ref: "components/business/photo-gallery.test.tsx#renders no Menu tab for a non-restaurant business, even with no isMenuPhoto photos; #renders a Menu tab for a restaurant with pinned menu photos, filtering correctly; #shows \"Menu not available yet\" when a restaurant has zero isMenuPhoto photos"
        status: pass
      - kind: manual_procedural
        ref: "curl http://localhost:3411/business/ministry-of-crab shows Photos+Menu tabs; /business/cafe-kumbuk shows neither tab"
        status: pass
    human_judgment: false
  - id: D6
    description: "next.config.ts restricts Next.js Image Optimization's remotePatterns to exactly picsum.photos (no wildcard), and every gallery tile uses a blurDataURL placeholder rather than a bare spinner"
    verification:
      - kind: integration
        ref: "npx next build succeeds with the new images.remotePatterns config; photo-gallery.tsx sets placeholder=\"blur\" + blurDataURL on every next/image tile"
        status: pass
    human_judgment: false
  - id: D7
    description: "Seed data's category slugs and attributes are valid against category-config.ts's taxonomy/schemas for all 13 seeded businesses, and re-running the seed script twice stays idempotent for businesses, hours, and photos"
    requirement: "LIST-05"
    verification:
      - kind: integration
        ref: "npx tsx prisma/seed.ts && npx tsx prisma/seed.ts (both exit 0, 13 businesses and 47 BusinessPhoto rows both times, confirmed via psql GROUP BY businessId)"
        status: pass
    human_judgment: false

duration: 11min
completed: 2026-09-13
status: complete
---

# Phase 1 Plan 03: Category Attributes, Photo Gallery & Restaurant Menu Tab Summary

**Full 16-leaf-category taxonomy with per-category strict Zod attribute schemas, safeParse-driven attribute badges, and a lazy-loaded photo gallery with a restaurant-only Menu tab, all wired into the live business page over corrected seed data.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-09-13T22:14:00+05:30 (approx.)
- **Completed:** 2026-09-13T22:24:57+05:30
- **Tasks:** 3
- **Files modified:** 13 (7 created, 6 modified)

## Accomplishments
- `category-config.ts` written test-first: full 9-group/16-leaf-category taxonomy (`categoryTaxonomy`) covering every RESEARCH-cited group plus all 4 Sri Lanka-specific leaf categories (tuk-repair, tutoring, wedding-vendors, tailoring), each with a `.strict()` Zod attribute schema (`attributeSchemaByCategory`) — 6 passing tests including the "no orphaned category" invariant and a strict-schema unknown-key rejection case
- `AttributeBadges` renders category-correct badges via `safeParse` (never throws on stale/legacy attribute data), verified live: Ministry of Crab (restaurant) shows Dine-in/Outdoor Seating/Alcohol Served/$$$$/Wifi/Parking badges; Cafe Kumbuk (cafe-bakery) shows Wifi/Outdoor Seating/Takeout/$$
- `PhotoGallery` renders a responsive, lazy-loaded, blur-placeholder photo grid with a correctly-gated restaurant-only Menu tab (shadcn Tabs), verified live: Ministry of Crab shows a working Photos/Menu tab switcher, Cafe Kumbuk shows no tabs at all
- Live business page now renders Attributes and Photos sections below Hours, matching UI-SPEC's locked section order (header, hours, attributes, gallery, menu)
- Fixed placeholder category slugs left over from 01-01/01-02's minimal seed (`cafe` → `cafe-bakery`, `vehicle-repair` → `auto-repair`) and replaced generic home-services-shaped attributes on auto-repair/tuk-repair/tutoring/wedding-vendors/tailoring businesses with their real category-specific attribute shapes — all 13 seeded businesses now validate against `attributeSchemaByCategory`
- Added 3-6 photos per business (47 total), with every restaurant getting at least 2 pinned `isMenuPhoto: true` photos; seed script re-run twice stays idempotent for businesses, hours, and photos (13 businesses, 47 photos both times)
- `next.config.ts` restricts Next.js Image Optimization to `picsum.photos` only (T-03-02)

## Task Commits

Each task was committed atomically:

1. **Task 1 [RED-GREEN]: Full category taxonomy + per-category attribute Zod schemas** - `188ac22` (test, RED→GREEN in one commit: test file authored and confirmed failing before `category-config.ts` existed, then implemented and verified passing)
2. **Task 2 [RED-GREEN]: Attribute badges + photo gallery with restaurant-only Menu tab** - `e08be53` (test, RED→GREEN in one commit: `photo-gallery.test.tsx` authored and confirmed failing before `photo-gallery.tsx` existed, then implemented and verified passing)
3. **Task 3: Wire attributes + gallery into the live business page, extend seed data** - `0e1500f` (feat)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `lib/categories/category-config.ts` - `categoryTaxonomy` (9 groups/16 leaves) + `attributeSchemaByCategory` (16 strict Zod schemas)
- `lib/categories/category-config.test.ts` - 6 tests covering the plan's `<behavior>` block exactly
- `components/business/attribute-badges.tsx` - `AttributeBadges`, safeParse-based category-conditional badge list
- `components/business/photo-gallery.tsx` - `PhotoGallery`, lazy-loaded blur-placeholder grid + restaurant-only Menu tab
- `components/business/photo-gallery.test.tsx` - 4 tests covering empty state, non-restaurant no-tab gate, restaurant tab filtering, empty menu state
- `components/ui/tabs.tsx`, `components/ui/aspect-ratio.tsx` - shadcn-generated primitives (Vega preset)
- `components/business/business-page.tsx` - renders `AttributeBadges` then `PhotoGallery` below Hours, per UI-SPEC order
- `components/business/business-page.test.tsx` - added attribute-badge and gallery-section assertions; updated mock categories to real taxonomy slugs
- `lib/validation/business.schema.ts` - added strict `photoRowSchema` + `photos` array field
- `next.config.ts` - `images.remotePatterns` restricted to `picsum.photos`
- `prisma/seed.ts` - validates `attributes` against `attributeSchemaByCategory[primaryCategory]` before upsert (T-03-01); delete-then-create idempotent `photos` nested relation
- `prisma/seed-data/businesses.json` - fixed category slugs, corrected attributes per category schema, added 3-6 photos per business (47 total), 2+ menu photos per restaurant

## Decisions Made

- Copied the restaurant/home-services/beauty-spa attribute schemas verbatim from 01-RESEARCH.md's Pattern 3 code example (exact field names and defaults) since the plan explicitly required matching that example
- Modeled `priceTier` as a required union of literals (no default) everywhere it appears, consistent with RESEARCH's restaurant example, rather than making it optional across the board
- `AttributeBadges` skips enum fields left at a non-informative default (`"none"`/`"all"`/`"other"`) rather than always rendering a badge for every set field, so a badge always communicates something concrete
- Fixed 01-01/01-02's placeholder category slugs and attribute shapes (see Files list) as an explicit, plan-mandated part of Task 3 — not treated as a deviation since the plan's own `<action>` text called for exactly this fix

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Radix Tabs test used the wrong DOM event to switch tabs**
- **Found during:** Task 2 (writing `photo-gallery.test.tsx`)
- **Issue:** `fireEvent.click(menuTab)` had no effect — Radix's `TabsTrigger` switches the active tab on `mousedown` (or `focus` under automatic activation mode), not `click`, so the RED test for tab-switching behavior failed to reach the expected GREEN state
- **Fix:** Changed the test to `fireEvent.mouseDown(menuTab)`, which matches Radix's actual event wiring (confirmed by reading `@radix-ui/react-tabs`'s source directly)
- **Files modified:** `components/business/photo-gallery.test.tsx`
- **Verification:** `npx vitest run components/business/photo-gallery.test.tsx` — all 4 tests pass
- **Committed in:** `e08be53`

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug, confined to test authoring)
**Impact on plan:** No production-code or scope impact — the fix corrected a test's simulated user interaction to match the real Radix Tabs component's actual (correct) event handling. No architectural changes.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None. `docker compose up -d db` was already running from 01-01/01-02; no new external service configuration required. Seed photos use `picsum.photos` placeholder URLs (no object storage account needed, per 01-RESEARCH.md's resolved Open Question #1 — real user-uploaded photo storage is deferred to Phase 5).

## Next Phase Readiness

- `category-config.ts`'s `categoryTaxonomy`/`attributeSchemaByCategory` are the locked taxonomy 01-04's full 100-300-business seed dataset must use for every business's `primaryCategories`/`attributes`
- `AttributeBadges`/`PhotoGallery` are stable, reusable components — 01-04 only needs to add more valid seed rows, not touch these components
- No blockers.

## Self-Check: PASSED

All 7 created files (lib/categories/category-config.ts, lib/categories/category-config.test.ts,
components/business/attribute-badges.tsx, components/business/photo-gallery.tsx,
components/business/photo-gallery.test.tsx, components/ui/tabs.tsx,
components/ui/aspect-ratio.tsx) confirmed present on disk. All 3 task commits (188ac22,
e08be53, 0e1500f) confirmed present in `git log`.

---
*Phase: 01-business-directory-foundation*
*Completed: 2026-09-13*
