# Phase 6: Data Foundation - Pattern Map

**Mapped:** 2026-09-24
**Files analyzed:** 18 (new + modified)
**Analogs found:** 16 / 18

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `prisma/schema.prisma` (add fields/enums) | model | CRUD | `prisma/schema.prisma` (existing `Business`/`User`/`BusinessPhoto` models) | exact — self-modification |
| `prisma/migrations/<new>_add_data_foundation_fields/migration.sql` | migration | batch | `prisma/migrations/20260916000017_add_photos_qa_collections/migration.sql` | exact |
| `prisma/seed.ts` (extend orchestration) | service | batch | `prisma/seed.ts` (existing) | exact — self-modification |
| `prisma/seed-data/businesses.json` (edit subset) | config | batch | itself | exact |
| `prisma/seed-data/users.json` (new) | config | batch | `prisma/seed-data/businesses.json` | role-match |
| `prisma/seed-data/review-sentence-banks.ts` (new) | utility | transform | none (net-new content module) | no analog |
| `prisma/seed-data/generators/generate-reviews.ts` (new) | service | transform | `lib/search/run-search-query.ts` (pure-function composition + named-constant weighting style) | partial |
| `prisma/seed-data/generators/generate-qa.ts` (new) | service | transform | `lib/search/run-search-query.ts` (same pure-function style) | partial |
| `prisma/seed-data/generators/generate-users.ts` (new, one-time script) | utility | batch | `prisma/seed.ts` (script entrypoint pattern) | partial |
| `scripts/fetch-seed-images.ts` (new, dev-run-once) | utility | file-I/O | `prisma/seed.ts` (script entrypoint / main().catch().finally() shape) | partial |
| `lib/validation/business.schema.ts` (extend, or new sibling schemas for review/user/QA seed input) | model | CRUD | `lib/validation/business.schema.ts` (existing `.strict()` seed schema) | exact |
| `lib/search/run-search-query.ts` (add `isTest: false`) | service | request-response | itself (existing file, one-line edit) | exact |
| `lib/home/load-rails.ts` (add `isTest: false`) | service | request-response | itself (existing file, one-line edit) | exact |
| `app/api/businesses/[slug]/route.ts` + `photos`/`questions`/`reviews` sub-routes (add `isTest: false`) | route | request-response | `app/api/listings/route.ts` (Prisma findUnique/create pattern in a route handler) | exact-ish (same file family) |
| `app/api/listings/route.ts` (add `isTest: false` on any list read, if applicable) | route | request-response | itself | exact |
| `app/api/collections/[id]/items/route.ts` (add `isTest: false` on business lookup) | route | request-response | itself | exact |
| `components/business/business-page.tsx` (fix category label bug) | component | request-response | itself (lines 76, 108-112, 120-127) | exact |
| `app/page.tsx`, `app/search/page.tsx`, `app/business/[slug]/page.tsx` (add `generateMetadata`) | route (Next.js page) | request-response | none exists yet in `app/` — net-new pattern per Next.js docs | no analog (see Code Examples in RESEARCH.md) |
| `next.config.ts` (extend `remotePatterns`, or drop entirely once picsum retired) | config | file-I/O | itself | exact |

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD)

**Analog:** itself — existing `Business`, `User`, `BusinessPhoto` model blocks (lines 13-123, 87-102)

**Field-addition pattern** — follow the existing style of inline comments explaining *why* a field exists, tagged with the requirement ID, placed adjacent to related fields:
```prisma
// DATA-01: paid-placement readiness fields for Phase 9's business-page
// "Request a Quote"/response-rate badge. Populated for a realistic minority
// subset of seeded businesses (not all), per 06-RESEARCH.md Assumption A5.
guaranteed          Boolean   @default(false)
responseTimeMinutes Int?
responseRate        Float?
```
```prisma
// DATA-02: elite-reviewer badge year, mirrors Yelp's "Elite YYYY". Nullable —
// most seeded users are not elite.
eliteYear Int?
```
```prisma
// DATA-03: test-fixture flag. Every read path serving a public UI surface
// MUST add `isTest: false` to its Prisma `where` — see lib/search/
// run-search-query.ts and lib/home/load-rails.ts for the enforcement point.
isTest Boolean @default(false)
```
Apply the identical `isTest Boolean @default(false)` field to `Business`, `Review`, and `User` models (three additions, same shape, per DATA-03's exact wording).

**Enum + tag field pattern** (DATA-07), modeled on the existing `VoteKind`/`ReportReason` enum style (lines 175-179, 223-229):
```prisma
enum PhotoTag {
  food
  inside
  outside
  menu
  drink
  video
}
```
Add `tag PhotoTag?` to `BusinessPhoto` (required by DATA-07) and, per RESEARCH.md's Open Question #1 recommendation, also to `ReviewPhoto` (nullable, unused by seed for now, avoiding a second migration in Phase 9).

**Index pattern reminder:** if any new field needs a lookup index (e.g. `isTest` used in every WHERE), follow the existing `@@index([...])` style already used on `Business` (lines 56-59) — e.g. `@@index([isTest])` is likely unnecessary given `isTest` is always combined with other filter conditions, but flag as a planner decision.

---

### `prisma/migrations/<new>/migration.sql` (migration, batch)

**Analog:** `prisma/migrations/20260916000017_add_photos_qa_collections/migration.sql` lines 1-7 (header comment) — this is the **sixth occurrence** of the same trap.

**Mandatory pre-apply edit, copy this exact structure:**
```sql
-- NOTE (hand-edited, see 01-01/02-01/03/04/05-01 precedent — this is the
-- SIXTH occurrence): Prisma's diff engine treats "Business_location_gist"
-- and "business_name_trgm_idx" as unmanaged drift (raw DDL, not @@index).
-- Auto-generated DROP INDEX for both, plus `ALTER COLUMN "searchable" DROP
-- DEFAULT` on the generated tsvector column, were removed — dropping
-- either index would regress geo-decay ranking / fuzzy-name search, and
-- DROP DEFAULT on a GENERATED ALWAYS column is rejected by Postgres.
```
**Procedure:** `prisma migrate dev --create-only` → open the generated `migration.sql` → delete any `DROP INDEX "Business_location_gist"`, `DROP INDEX "business_name_trgm_idx"`, `ALTER COLUMN "searchable" DROP DEFAULT` statements → prepend the header comment above (renumbered to "sixth") → `prisma migrate dev` to apply. Grep the generated file for `DROP INDEX`/`DROP DEFAULT` before applying, every time.

---

### `prisma/seed.ts` (service, batch) — extend, don't replace

**Analog:** itself, lines 1-143 (`validateAll` pre-write pass + single `$transaction` orchestration)

**Imports pattern** (lines 1-6):
```typescript
import type { Prisma } from "../lib/generated/prisma";
import { prisma } from "../lib/prisma";
import { businessSeedSchema, type BusinessSeedInput } from "../lib/validation/business.schema";
import { attributeSchemaByCategory } from "../lib/categories/category-config";
import { seedPhoneForSlug } from "../lib/businesses/seed-phone";
import businessesData from "./seed-data/businesses.json" with { type: "json" };
```
New generator modules (reviews/users/qa) should be imported the same way, then run through their own `validateAll`-style function (see Pitfall 4 in RESEARCH.md — generated review text MUST be re-validated through the *same* `reviewCreateSchema` Zod schema the live API uses, not a parallel one).

**Validate-before-any-write pattern** (lines 13-75) — the whole point: every record parsed + validated (schema, per-category attributes, slug uniqueness) and *all* errors collected before any DB write. Extend this exact shape for reviews (rating/text-length/date-range), users (60+ count, field presence), and Q&A (0-5 threads, answer length 10-2000 chars per existing `question.schema.ts` constraints) — do not validate inline inside the upsert loop.

**Single-transaction, idempotent upsert pattern** (lines 85-130) — `tx.business.upsert` (never `.create()`), then delete-then-create nested relations (`businessHours.deleteMany` → `createMany`). Apply the identical delete-then-create shape for seeded `Review`/`ReviewVote`/`Question`/`Answer` rows keyed by business, so re-running `prisma db seed` stays idempotent rather than duplicating content on every run.

**Error handling / exit pattern** (lines 136-143):
```typescript
main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
Reuse verbatim for `scripts/fetch-seed-images.ts` and `prisma/seed-data/generators/generate-users.ts` (both are standalone script entrypoints).

---

### `lib/validation/business.schema.ts` sibling schemas (model, CRUD)

**Analog:** `lib/validation/business.schema.ts` lines 22-38 (`businessSeedSchema`, `.strict()`)

**`.strict()` pattern to replicate** for any new `reviewSeedSchema`/`userSeedSchema`/`qaSeedSchema`:
```typescript
export const businessSeedSchema = z
  .object({ /* ...fields... */ })
  .strict();
```
`.strict()` is load-bearing here (rejects any unrecognized key, e.g. accidentally leaking a `zip` field per the LOC-02 comment at lines 15-17) — apply the same `.strict()` call to every new seed-input schema, not just business.

**Reuse existing schemas, don't duplicate constraints** (Pitfall 4): `lib/validation/review.schema.ts` lines 4-12 already define `text: z.string().min(50).max(5000)` via `createReviewSchema` — the reviews generator's validation pass should import and reuse `createReviewSchema` (or its `.min(50).max(5000)` constraint) rather than hand-rolling a parallel bound, so generated seed reviews never violate the same constraint the live API enforces.
```typescript
// lib/validation/review.schema.ts (existing, reuse directly)
export const createReviewSchema = z
  .object({
    businessId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(50).max(5000),
    visitDate: z.string().datetime().optional(),
    photos: z.array(photoUrlSchema).max(10).optional(),
  })
  .strict();
```

---

### `prisma/seed-data/generators/generate-reviews.ts` / `generate-qa.ts` (service, transform)

**Analog:** `lib/search/run-search-query.ts` — not a literal code match, but the closest existing example of a **pure, named-constant-driven scoring/composition function** in this codebase (lines 47-51, 60-74 — `W_TEXT`/`W_GEO`/`W_RATING`, `RATING_PRIOR_WEIGHT` as named tunables with comments explaining the "why", not magic numbers). Apply the same "named constant + comment" discipline to rating-distribution weights (e.g. `const RATING_DISTRIBUTION_WEIGHTS = [1, 1, 2, 4, 5]` for stars 1-5) and word-count bounds.

**Deterministic seeding pattern** (from RESEARCH.md Code Examples, to be followed exactly):
```typescript
import { faker } from "@faker-js/faker";

function seededUser(index: number) {
  faker.seed(1000 + index); // stable across every seed re-run
  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()[0]}.`,
    city: faker.helpers.arrayElement(["Colombo", "Kandy", "Galle", "Negombo", "Nugegoda"]),
  };
}
```
Seed once per deterministic unit (per business/user index), never once globally — reseeding mid-loop drifts the sequence (documented pitfall in RESEARCH.md).

**No Prisma calls inside generators** — `seed.ts` remains the only file that talks to the database (Pattern 1 in RESEARCH.md); generators are pure functions returning plain data objects.

---

### `lib/search/run-search-query.ts` / `lib/home/load-rails.ts` (service, request-response) — `isTest` filter

**Analog:** itself — existing `WHERE`/`where` construction

**Raw-SQL WHERE pattern** (`run-search-query.ts` lines 143-164, `buildFilterConditions` lines 96-132): add `isTest: false` as an unconditional base condition, not one of the optional `conditions.push(...)` entries:
```typescript
// lib/search/run-search-query.ts — unconditional, always applied
return prisma.$queryRaw<CandidateRow[]>(Prisma.sql`
  SELECT ...
  FROM "Business"
  WHERE "isTest" = false AND ${whereClause}
  ORDER BY "score" DESC
`);
```
Also add `isTest: false` to the batch `prisma.business.findMany({ where: { id: { in: candidateIds } }, ... })` call at line 281 — the raw query and the Prisma-client hydration query both touch `Business` and both need the filter (defense in depth against a future refactor that bypasses one path).

**Prisma-client `where` pattern** (`load-rails.ts` lines 90-95, 105-112):
```typescript
export async function loadTopRatedBusinesses(): Promise<DiscoveryRailBusiness[]> {
  const rows = await prisma.business.findMany({
    where: { isTest: false, avgRating: { not: null }, reviewCount: { gt: 0 } },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: RAIL_SIZE,
    select: railSelect,
  });
  ...
}
```
Apply the identical `isTest: false` addition to `loadRelatedBusinesses` (line 105-110) and `computeOpenNowByBusinessId` (line 52, if that function is ever used for a public list rather than a single already-fetched business).

---

### `app/api/businesses/[slug]/route.ts` + sub-routes, `app/api/listings/route.ts`, `app/api/collections/[id]/items/route.ts` (route, request-response)

**Analog:** `app/api/listings/route.ts` lines 39-45 and `app/api/collections/[id]/items/route.ts` lines 40-46 — existing `prisma.business.findUnique`/`findFirst` lookups.

**Pattern to apply** — every `prisma.business.findUnique`/`findFirst` used to resolve a public-facing business (not an owner-authenticated write target) should filter `isTest: false`:
```typescript
// app/api/collections/[id]/items/route.ts line 40-43, pattern to extend
const business = await prisma.business.findUnique({
  where: { id: parsed.data.businessId, isTest: false },
  select: { id: true },
});
```
Note: `app/api/listings/route.ts`'s `PATCH` (updating an owner's own claimed listing) and `app/api/businesses/[slug]/claim/*` routes are **write paths for the record's own owner**, not public reads — per RESEARCH.md's Pattern 2, `isTest` filtering applies to public list/detail *reads*, not owner-authenticated single-record writes; do not add `isTest: false` to the `PATCH` business lookup at `app/api/listings/route.ts` lines 17-20 unless the planner decides claimed test fixtures should also be unclaimable (out of scope per RESEARCH.md's exhaustive file list, which does not include this PATCH route).

**Error-response shape** (`app/api/listings/route.ts` lines 21-23, `app/api/collections/[id]/items/route.ts` lines 44-46) — reuse verbatim for any new 404 branch introduced by an `isTest: false` filter (a test-fixture business now correctly 404s instead of leaking):
```typescript
if (!business) {
  return NextResponse.json({ error: "Business not found" }, { status: 404 });
}
```

---

### `components/business/business-page.tsx` (component, request-response) — category label bug fix

**Analog:** itself, line 76 (already-correct usage) vs. lines 108-112 and 120-127 (the bug)

**Already-correct pattern** (line 76):
```tsx
{getCategoryLabel(business.primaryCategories[0]) ?? business.primaryCategories[0]}
```

**Bug — primary category badges** (lines 108-112, currently render raw slug):
```tsx
{business.primaryCategories.map((category) => (
  <Badge key={category} variant="secondary">
    {category}
  </Badge>
))}
```
**Fix:**
```tsx
{business.primaryCategories.map((category) => (
  <Badge key={category} variant="secondary">
    {getCategoryLabel(category) ?? category}
  </Badge>
))}
```

**Bug — secondary category badges** (lines 120-127, same issue):
```tsx
{business.secondaryCategories.map((category) => (
  <Badge key={category} variant="outline" data-testid="secondary-category-badge">
    {category}
  </Badge>
))}
```
**Fix:** identical `{getCategoryLabel(category) ?? category}` substitution. `getCategoryLabel` is already imported at line 29 — no new import needed.

---

### `app/page.tsx`, `app/search/page.tsx`, `app/business/[slug]/page.tsx` (route, request-response) — `generateMetadata`

**No in-repo analog** (`grep -rl "generateMetadata" app/` returns nothing — this is a net-new pattern for this codebase). Use the Next.js App Router API directly, per RESEARCH.md's cited Code Example:
```typescript
// app/business/[slug]/page.tsx
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessDetail(slug); // reuse the page's existing loader
  if (!business) return {}; // falls back to root layout's generic title on 404
  return {
    title: `${business.name} - ... - ${getCategoryLabel(business.primaryCategories[0])} - LankaReview`,
  };
}
```
Root layout's existing `metadata = { title: "LankaReview", ... }` in `app/layout.tsx` remains the fallback for any page that doesn't (yet) export `generateMetadata` — no change needed there.

---

### `next.config.ts` (config, file-I/O)

**Analog:** itself, lines 3-16 — `remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }]`. Since DATA-04 retires `picsum.photos` as a seed-image source, either remove this entry entirely (if no other remote-image use remains) or leave it if any non-seed feature still references picsum — confirm with a grep of the codebase for `picsum` before removing, since the comment at lines 5-8 documents this as a deliberate Phase 1 choice being retired here.

## Shared Patterns

### `isTest: false` mandatory read filter
**Source:** `lib/search/run-search-query.ts`, `lib/home/load-rails.ts` (this phase's own edits)
**Apply to:** Every `prisma.business.find*`/`prisma.review.find*` call in `lib/search/run-search-query.ts`, `lib/search/business-open-now.ts` (not read this session — locate via `grep -n "prisma.business" lib/search/business-open-now.ts`), `lib/home/load-rails.ts`, `app/api/businesses/[slug]/route.ts` and its `photos`/`questions`/`reviews` sub-routes, `app/api/listings/route.ts` (GET/list paths only, not the owner-authenticated PATCH), `app/api/collections/[id]/items/route.ts`. Filter server-side in the Prisma `where`, never in a Server Component after fetch (Anti-Pattern explicitly called out in RESEARCH.md).

### Validate-before-write (`validateAll` / `.strict()` Zod)
**Source:** `prisma/seed.ts` lines 19-75, `lib/validation/business.schema.ts` lines 22-38
**Apply to:** Every new seed content type (reviews, users, Q&A) — collect all validation errors before any transaction opens; every new/extended Zod object schema uses `.strict()`.

### Idempotent seed writes (upsert + delete-then-create nested rows)
**Source:** `prisma/seed.ts` lines 91-128
**Apply to:** All new seed content (`Review`, `ReviewVote`, `Question`, `Answer`, `BusinessPhoto.tag` backfill) — re-running `prisma db seed` must never duplicate rows.

### The sixth Prisma migration DROP INDEX/DROP DEFAULT trap
**Source:** `prisma/migrations/20260916000017_add_photos_qa_collections/migration.sql` lines 1-7 (and four earlier migrations before it)
**Apply to:** The single new migration this phase produces. Always grep the generated `migration.sql` for `DROP INDEX`/`DROP DEFAULT` referencing `location`/`searchable`/`Business_location_gist`/`business_name_trgm_idx` before applying.

### Script entrypoint shape (`main().catch().finally()`)
**Source:** `prisma/seed.ts` lines 136-143
**Apply to:** `scripts/fetch-seed-images.ts`, `prisma/seed-data/generators/generate-users.ts` (both standalone dev-run scripts).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `prisma/seed-data/review-sentence-banks.ts` | utility | transform | Net-new content-composition module; no existing sentence-bank/template pattern exists in this codebase. Follow RESEARCH.md's Pitfall 4 guidance directly (≥15-20 fragments per category/rating-tier slot to avoid collision). |
| `app/page.tsx`, `app/search/page.tsx`, `app/business/[slug]/page.tsx` `generateMetadata` exports | route | request-response | Zero existing usage in `app/` (verified via grep); use the Next.js App Router official API pattern from RESEARCH.md's Code Examples section directly, not a codebase analog. |

## Metadata

**Analog search scope:** `prisma/`, `lib/validation/`, `lib/search/`, `lib/home/`, `app/api/businesses/`, `app/api/listings/`, `app/api/collections/`, `components/business/`, `next.config.ts`
**Files scanned:** 18 target files + 11 analog source files read directly this session
**Pattern extraction date:** 2026-09-24
