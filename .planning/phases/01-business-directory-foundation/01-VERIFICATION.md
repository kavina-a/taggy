---
phase: 01-business-directory-foundation
verified: 2026-09-13T17:22:11Z
status: gaps_found
score: 4/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "A user can open a business profile page showing its name, up to 3 primary + unlimited secondary categories, description, and a district/DS-division + free-text address (no ZIP) with an accurate lat/lng map pin."
    status: partial
    reason: >
      Primary categories, name, description, address, and the Leaflet map pin all render
      correctly and are backed by real seeded data. However, `secondaryCategories` — an
      explicit half of this ROADMAP success criterion and of LIST-01's requirement text
      ("categories (up to 3 primary + unlimited secondary)") — is fetched into
      `BusinessDetail` and stored in Postgres for all 107 seeded businesses (confirmed
      non-empty for all 107 records), but is never rendered anywhere on the business page.
      `components/business/business-page.tsx` only maps over `business.primaryCategories`
      when rendering category badges; `business.secondaryCategories` is computed in
      `app/business/[slug]/page.tsx` but dropped on the floor before reaching the view.
      The component test suite doesn't catch this because its mock `BusinessDetail` uses
      `secondaryCategories: []`, so the gap is invisible to `npx vitest run`.
    artifacts:
      - path: "components/business/business-page.tsx"
        issue: "Header section renders `business.primaryCategories.map(...)` only — no rendering of `business.secondaryCategories` anywhere in the file"
      - path: "components/business/business-page.test.tsx"
        issue: "Mock `BusinessDetail` sets `secondaryCategories: []`, so no test exercises secondary-category rendering either way"
    missing:
      - "Render `business.secondaryCategories` on the business profile page (e.g. as a visually distinct badge group below/beside the primary category badges), so the explicit ROADMAP Success Criterion #1 and LIST-01 requirement text are both fully satisfied"
      - "Add a component test asserting secondary categories are visible, using a mock with non-empty `secondaryCategories` (mirroring the real seed data, which has non-empty secondary categories for every one of the 107 businesses)"
---

# Phase 1: Business Directory Foundation Verification Report

**Phase Goal:** A real, structured, browsable directory of Colombo businesses exists — the
foundation every later phase (search, reviews, photos) is built on top of.
**Verified:** 2026-09-13T17:22:11Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

Truths merged from ROADMAP.md Success Criteria (authoritative) and the 4 plans' `must_haves.truths`.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A user can open a business profile page showing its name, up to 3 primary + unlimited secondary categories, description, and a district/DS-division + free-text address (no ZIP) with an accurate lat/lng map pin (ROADMAP SC1 / LIST-01 / LOC-02) | ✗ FAILED (partial) | Name/description/address/map pin/primary categories all verified live (`curl`-equivalent via Playwright e2e + component tests + live DB query). `secondaryCategories` is fetched (`app/business/[slug]/page.tsx:30`) but never rendered in `components/business/business-page.tsx` — confirmed by full-file read and `grep -rn secondaryCategories` across non-generated source, which shows zero rendering call sites. All 107 live seeded businesses have non-empty `secondaryCategories` (`jq` query), so this is not a hypothetical gap — real data is silently dropped from the UI. ZIP rejection: `businessSeedSchema.strict()` + passing test confirms LOC-02. |
| 2 | A user can see a business's structured 7-day hours with split shifts and holiday overrides, plus a live "Open now"/"Closed" state (ROADMAP SC2 / LIST-02) | ✓ VERIFIED | `lib/hours/compute-open-now.ts` read line-by-line; algorithm checks `[yesterday, today]`, overrides take precedence, midnight-crossing math (`+24h` when `crossesMidnight`) confirmed correct by manual trace of the hardest test case (yesterday's override crossing into today). 7 unit tests in `compute-open-now.test.ts` pass (`npx vitest run`, independently re-run). Live seed data contains a real midnight-crossing shift (6 nightlife/restaurant businesses, e.g. `ministry-of-crab`) and a real holiday override (`upalis-by-nawaloka`, 2026-12-25). `HoursAccordion` renders split shifts comma-joined and a green/gray (never red) badge, wired into `app/business/[slug]/page.tsx` via `computeOpenNow(...)` server-side with hardcoded `Asia/Colombo` zone. E2e test independently re-run and passes. |
| 3 | A user can view category-conditional attributes and browse a photo gallery, with restaurants showing a dedicated pinned menu tab (ROADMAP SC3 / LIST-03 / LIST-04) | ✓ VERIFIED | `lib/categories/category-config.ts` defines 16 leaf categories, each with a `.strict()` Zod attribute schema; `AttributeBadges` uses `safeParse` and is wired into `business-page.tsx`. `PhotoGallery` gates the Menu tab strictly on `primaryCategories.includes("restaurant")` (confirmed in source), with correct empty states ("No photos yet" / "Menu not available yet") matching UI-SPEC copy verbatim. `photo-gallery.test.tsx` (4 cases) and `category-config.test.ts` (6 cases) independently re-run and pass. |
| 4 | The directory already contains real, seeded Colombo businesses spanning the Sri Lanka-relevant category taxonomy (tuk repair, tutoring, wedding vendors, tailoring), so the app isn't empty at first use (ROADMAP SC4 / LIST-05 / LIST-06) | ✓ VERIFIED | Live DB query (`npx tsx prisma/scripts/count-businesses.ts`) independently returns 107. `jq` confirms 107 unique slugs, all 16 leaf categories present with restaurant largest (20) and every other leaf ≥ 5, all coordinates within the Colombo bounding box (0 out-of-box entries). `prisma/seed.ts` independently reviewed: fail-fast pre-write validation (schema + per-category attributes + slug-uniqueness) wrapped in a single `prisma.$transaction`, matching plan 01-04's Task 2 exactly. |
| 5 | Directory index groups businesses by top-level category with server-side pagination (plan 01-04 must_have, supporting SC4) | ✓ VERIFIED | `app/directory/page.tsx` groups by `categoryTaxonomy` group via `CATEGORY_LOOKUP`, uses a fixed `PAGE_SIZE = 24` with Prisma `take`/`skip` driven only by `?page=` (client cannot control page size), invalid `page` values fall back to 1. E2e test asserts a level-2 category-group heading is visible before clicking through — independently re-run, passes. |

**Score:** 4/5 truths verified (1 partial fail — secondary categories never rendered)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/schema.prisma` | Business/BusinessHours/BusinessHoursOverride/BusinessPhoto models, dual-column geo | ✓ VERIFIED | All 4 models present exactly as specified; migration files present |
| `lib/types/business.ts` | Shared types incl. `BusinessDetail.secondaryCategories` | ✓ VERIFIED (data), ⚠️ downstream gap | Type includes the field; the field is populated but not consumed by the view layer (see Truth 1 gap) |
| `lib/validation/business.schema.ts` | `businessSeedSchema` (Zod `.strict()`) | ✓ VERIFIED | `.strict()` confirmed; ZIP-rejection test passes |
| `prisma/seed.ts` | Idempotent, transactional, fail-fast seed runner | ✓ VERIFIED | `prisma.$transaction` wraps all writes; `validateAll()` pre-write pass; live re-run confirms stable count |
| `prisma/seed-data/businesses.json` | 100-300 real Colombo businesses | ✓ VERIFIED | 107 entries, 107 unique slugs, all in Colombo bounding box |
| `app/directory/page.tsx` | Category-grouped, paginated index | ✓ VERIFIED | Grouping + `take`/`skip` pagination confirmed in source |
| `app/business/[slug]/page.tsx` | Business profile route | ✓ VERIFIED (wiring), ⚠️ incomplete data use | Fetches and maps all `BusinessDetail` fields including `secondaryCategories`, but the mapped value is dropped by the presentational component |
| `components/business/business-page.tsx` | Presentational business page view | ⚠️ INCOMPLETE | Renders name/description/address/map/hours/attributes/photos correctly; does not render `secondaryCategories` anywhere |
| `components/business/business-map.tsx` | Client Leaflet map pin | ✓ VERIFIED | `MapContainer`/`Marker` at `[latitude, longitude]`, `data-testid="business-map"` present |
| `lib/hours/compute-open-now.ts` | Overnight/holiday-safe open-now algorithm | ✓ VERIFIED | Manually traced against RESEARCH.md's hardest case; matches |
| `components/business/hours-accordion.tsx` | 7-day hours + status badge | ✓ VERIFIED | Correct badge colors (green/neutral-gray, never red), split-shift grouping, dynamic aria-label |
| `lib/categories/category-config.ts` | 16-leaf taxonomy + attribute schemas | ✓ VERIFIED | All 16 leaves present, all 4 SL-specific categories present, no orphaned schema |
| `components/business/attribute-badges.tsx` | Category-conditional badges | ✓ VERIFIED | `safeParse`-based, never throws on stale data |
| `components/business/photo-gallery.tsx` | Gallery + restaurant Menu tab | ✓ VERIFIED | Menu tab strictly gated on `primaryCategories.includes("restaurant")`; blur placeholders on every tile |
| `prisma/scripts/count-businesses.ts` | Standalone count script | ✓ VERIFIED | Ran independently, printed `107` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `components/directory/business-card.tsx` | `app/business/[slug]/page.tsx` | `Link href=/business/${slug}` | ✓ WIRED | Confirmed in source and by passing e2e click-through |
| `app/business/[slug]/page.tsx` | `prisma/schema.prisma` | `prisma.business.findUnique` with hours/overrides/photos relations | ✓ WIRED | Confirmed in source |
| `app/business/[slug]/page.tsx` | `lib/hours/compute-open-now.ts` | `computeOpenNow(...)` server-side | ✓ WIRED | Confirmed, uses `DateTime.now().setZone("Asia/Colombo")` |
| `components/business/business-page.tsx` | `components/business/hours-accordion.tsx` | `<HoursAccordion .../>` | ✓ WIRED | Confirmed |
| `components/business/business-page.tsx` | `lib/categories/category-config.ts` | `attributeSchemaByCategory[...]` via `AttributeBadges` | ✓ WIRED | Confirmed |
| `components/business/photo-gallery.tsx` | `lib/types/business.ts` | filters by `isMenuPhoto`, gated on `restaurant` | ✓ WIRED | Confirmed |
| `prisma/seed.ts` | `prisma/schema.prisma` | `prisma.$transaction` wrapping all upserts | ✓ WIRED | Confirmed |
| `app/directory/page.tsx` | `lib/categories/category-config.ts` | groups by `categoryTaxonomy` | ✓ WIRED | Confirmed |
| `app/business/[slug]/page.tsx` | `components/business/business-page.tsx` | `business.secondaryCategories` value | ✗ NOT WIRED | Value is computed and passed down inside `BusinessDetail` but the presentational component never reads/renders `business.secondaryCategories` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `app/directory/page.tsx` | `businesses` | `prisma.business.findMany` (live Postgres, 107 rows) | Yes | ✓ FLOWING |
| `app/business/[slug]/page.tsx` | `business` | `prisma.business.findUnique` (live Postgres) | Yes | ✓ FLOWING |
| `components/business/business-page.tsx` | `business.primaryCategories` | Prop from real Prisma row | Yes | ✓ FLOWING |
| `components/business/business-page.tsx` | `business.secondaryCategories` | Prop from real Prisma row (non-empty for all 107 businesses) | Computed but never read by any JSX in the component | ✗ DISCONNECTED (data flows to the component but is never consumed/rendered) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Unit/component suite | `npx vitest run` | 5 files, 30/30 tests passed | ✓ PASS |
| E2e smoke path | `npx playwright test e2e/directory-to-business.spec.ts` | 1/1 passed | ✓ PASS |
| Live seed count | `npx tsx prisma/scripts/count-businesses.ts` | `107` | ✓ PASS |
| Seed data integrity | `jq` unique-slug / bounding-box checks | 107 unique slugs, 0 out-of-bounds coordinates | ✓ PASS |
| `computeOpenNow` overnight+override logic | Manual trace of yesterday's-override-crossing-midnight test case | Traced start/end shift math by hand, matches expected `true` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LIST-01 | 01-01 | Name, categories (primary+secondary), description, address, lat/lng | ⚠️ PARTIAL | Primary categories/name/description/address/lat-lng all render; secondary categories do not (see gap above) |
| LOC-02 | 01-01 | Address model never accepts/exposes ZIP | ✓ SATISFIED | `.strict()` Zod schema, passing test |
| LIST-06 | 01-01, 01-04 | Seeded starter dataset so search isn't empty | ✓ SATISFIED | 107 live businesses, idempotent transactional seed |
| LIST-02 | 01-02 | Structured hours + computed open/closed state | ✓ SATISFIED | `computeOpenNow` correct on overnight + holiday-override cases, live-wired |
| LIST-03 | 01-03 | Category-conditional attributes (jsonb) | ✓ SATISFIED | 16 strict per-category Zod schemas, `AttributeBadges` wired |
| LIST-04 | 01-03 | Photo gallery + restaurant menu tab | ✓ SATISFIED | `PhotoGallery` with correctly-gated Menu tab |
| LIST-05 | 01-03, 01-04 | SL-relevant category taxonomy incl. tuk repair/tutoring/wedding vendors/tailoring | ✓ SATISFIED | All 4 present in `categoryTaxonomy` and represented in live seed data (≥5 each) |

No orphaned requirements: all 7 phase requirement IDs (LIST-01..06, LOC-02) appear in at least one plan's `requirements:` frontmatter, and every ID maps to verified (or partially verified) implementation evidence above.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/business/business-page.tsx` | header section | Silently drops `business.secondaryCategories` (data present, prop available, never rendered) | 🛑 Blocker | Directly contradicts ROADMAP Success Criterion #1 and LIST-01's requirement text |
| (none) | — | No `TODO`/`FIXME`/`XXX`/`HACK`/`PLACEHOLDER` debt markers found in any phase-modified source file | — | Clean |
| UI-SPEC `breadcrumb` component | not used anywhere | shadcn `breadcrumb` primitive was generated (`components/ui/breadcrumb.tsx`) per UI-SPEC's Registry Safety inventory ("Directory > Category > Business Name navigation trail") but is never imported/rendered by `business-page.tsx` or any other component | ⚠️ Warning | Minor UI-SPEC deviation — not listed as a `must_haves` truth in any plan, so does not block the phase goal, but is an unused registered component and a locked-spec item silently skipped with no entry in any SUMMARY's "Deviations from Plan" section |

### Human Verification Required

None. All must-have truths and gaps in this phase are programmatically verifiable (component/unit tests, live database queries, and e2e smoke tests) — no visual, real-time, or subjective judgment call is needed to confirm or refute the secondary-categories gap.

### Gaps Summary

Phase 1 is substantially complete and of high quality: the hours/open-now algorithm was correctly implemented against both of RESEARCH.md's flagged pitfalls (verified independently, not just trusted from SUMMARY.md), the category taxonomy and attribute schemas are complete and correctly gated, the photo gallery/menu-tab logic is correctly restaurant-gated, the seed pipeline is genuinely transactional and idempotent (independently re-verified against a live 107-row database, not just re-reading the SUMMARY's claim), and the directory index's grouping/pagination is real and server-controlled.

However, one concrete, verifiable gap blocks a clean pass: **secondary categories are stored, seeded (non-empty for all 107 real businesses), and fetched into the view layer's own `BusinessDetail` prop — but are never rendered anywhere on the business profile page.** This is not a hypothetical or cosmetic miss: it is half of ROADMAP Success Criterion #1's literal wording ("up to 3 primary + unlimited secondary categories") and of LIST-01's own requirement text. The component test suite didn't catch this because its mock business object conveniently uses an empty `secondaryCategories: []` array, so the missing render path was never exercised by any test — a textbook case of "task completed" (categories are shown) without "goal achieved" (both category tiers are shown, as specified).

This is a narrow, well-scoped gap: the data model, seed data, and fetch/type plumbing are all already correct; only the presentational rendering in `components/business/business-page.tsx` (and an accompanying test case with non-empty mock data) needs to be added. Recommend a small closure plan targeting exactly this component before advancing to Phase 2.

---

*Verified: 2026-09-13T17:22:11Z*
*Verifier: Claude (gsd-verifier)*
