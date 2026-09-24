# Phase 6: Data Foundation - Research

**Researched:** 2026-09-24
**Domain:** Prisma schema evolution + offline data seeding (images, synthetic review/user/Q&A content) for a Next.js 16 / Prisma 7 / Postgres app
**Confidence:** HIGH

## Summary

Phase 6 is a **schema-migration + seed-pipeline** phase, not a UI phase. Nearly all of the
work happens in three places: `prisma/schema.prisma` (new fields/enums), `prisma/seed.ts` +
`prisma/seed-data/` (new/expanded fixtures and generation logic), and a handful of read-path
files that must start filtering `isTest: false`. Only one genuine UI bug fix is in scope
(the raw-category-slug chips on the business page) and one genuinely new code surface
(`generateMetadata` on three pages, currently absent everywhere in `app/`).

The two hard open questions the phase description flags — image sourcing and bulk review-text
generation — both have low-cost, zero-recurring-cost answers that fit this project's
established "offline, deterministic, no external API calls at seed-run time" pattern (see
`## Don't Hand-Roll` and `## Common Pitfalls` below): a **one-time, developer-run image-fetch
script** (not part of `prisma db seed`) that pulls from Pexels/Pixabay and commits the files
to `/public/seed`, and a **template/sentence-bank composition module** checked into
`prisma/seed-data/` for review text, not an LLM call per review. This exactly mirrors how
`businesses.json` is already treated: a static, checked-in fixture that `seed.ts` validates
and upserts idempotently.

The single highest-risk item in this phase is **not** image sourcing or text generation — it
is correctly threading a new `isTest` filter through every existing Business/Review/User read
path (search, directory, home rails, business detail, Q&A, collections) without regressing
any of Phases 1-5's already-shipped, tested behavior. This is a "touch many files, each
one-line" risk profile, not a "hard problem" risk profile.

**Primary recommendation:** Do the schema migration first (one migration, all new
fields/enums in one pass, repeating the now-six-times-documented DROP INDEX/DROP DEFAULT
strip), then build seed-data generation as pure, testable TypeScript modules under
`prisma/seed-data/generators/` that `seed.ts` imports and validates through the same
`validateAll`-before-any-write pattern already established, then fix the two isolated UI
bugs (category chips, missing metadata) last since they have no dependency on the seed data
existing.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Business schema has `guaranteed`, `responseTime`, `responseRate` fields | Architecture Patterns (Recommended Project Structure), Open Question #2 (numeric `responseTimeMinutes` vs. prose label recommendation), Assumptions Log A5 (seed-coverage judgment call) |
| DATA-02 | User schema has an `eliteYear` field | Architecture Patterns (Recommended Project Structure); no open question — straightforward nullable `Int?` addition |
| DATA-03 | Business/Review/User records support an `isTest` flag; all `mu3…` fixtures flagged/deleted and excluded from every UI surface | Architecture Pattern 2 (exhaustive file list of every read path needing `isTest: false`), Common Pitfalls (Security Domain threat table), Known Threat Patterns |
| DATA-04 | All seed business photos are local, category-matched images under `/public/seed`, not `picsum.photos` URLs | Summary, Common Pitfalls 1 & 3, Standard Stack (Pexels/Pixabay), State of the Art (Unsplash Source deprecation), Environment Availability |
| DATA-05 | Business page renders human-readable category labels everywhere, never a raw slug | Exact bug located and verified: `components/business/business-page.tsx` lines 108-112 (primary category badges) and 120-127 (secondary category badges) render the raw `category` string directly instead of `getCategoryLabel(category) ?? category` — the breadcrumb at line 76 already does this correctly, and `getCategoryLabel` is already imported (line 29) but only partially used. Fix is a two-line change reusing existing code, no new logic needed. |
| DATA-06 | Every seeded business has 5-60 reviews, realistic rating distribution, dates over 3 years, 80-400 word bodies, some with 1-3 photos | Architecture Pattern 1 (generator module pattern), Don't Hand-Roll (rating-distribution helper), Common Pitfalls 4 (text-length/duplication), Validation Architecture test map |
| DATA-07 | Seeded reviews carry vote counts (Useful/Funny/Cool); seeded photos carry a content tag | Common Pitfalls 5 (ReviewVote row consistency), Open Question #1 (tag field scope: BusinessPhoto only vs. also ReviewPhoto), Assumptions Log A3 |
| DATA-08 | Every seeded business has 0-5 Q&A threads with answers | Architecture Pattern 1 (generator module pattern — `generate-qa.ts`), Validation Architecture test map, reuses existing `question.schema.ts`/answer length constraints (min 10/max 500 and 2000 chars respectively) |
| DATA-09 | 60+ seeded users with avatar, name, city, friend/review/photo counts, `eliteYear` | Standard Stack (`@faker-js/faker` for names/cities), Alternatives Considered (hand-rolled initials avatar vs. `@dicebear/core`), Package Legitimacy Audit, Code Examples (deterministic faker seeding) |
| DATA-10 | Business, search, and home pages emit `generateMetadata` titles, never literal "localhost" | Code Examples (`generateMetadata` pattern + root-cause verification that current fallback is "LankaReview", not literally "localhost"), Validation Architecture test map |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Schema fields (isTest, eliteYear, guaranteed, responseTime, responseRate, photo tag) | Database / Storage | — | Pure Prisma schema + migration; no runtime logic |
| Seed content generation (reviews, users, Q&A, photo tags) | Database / Storage (seed script) | — | Offline, one-time `prisma db seed` run; not an API/backend concern |
| Image acquisition (Pexels/Pixabay fetch → `/public/seed`) | Build-time tooling (dev-run script) | CDN / Static (served by Next.js `public/`) | Runs once at authoring time, not at request time; output is static assets |
| `isTest` filtering on reads | API / Backend (Prisma query layer) | — | Every existing `prisma.business/review/user.find*` call is the enforcement point |
| Category label rendering fix | Browser / Client (Server Component render) | — | Pure presentational fix in `business-page.tsx`, reuses existing `getCategoryLabel` |
| `generateMetadata` titles | Frontend Server (SSR) | — | Next.js App Router metadata resolution happens server-side per request/build |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma ORM | 7.10.0 (already pinned) | Schema migration, seed upserts | Already the project's ORM; no alternative considered |
| Zod | 4.6.4 (already pinned) | Extend `.strict()` seed-schema validation to reviews/users/Q&A | Matches `businessSeedSchema` pattern already in `lib/validation/business.schema.ts` |
| `sharp` | 0.35.4 (already a dependency) | Resize/optimize downloaded stock photos to consistent seed dimensions; rasterize SVG avatar placeholders | Already used for Phase 5's `classifyPhoto` pixel checks — no new image-processing dependency needed |
| `luxon` | 3.7.2 (already a dependency) | Generate review/Q&A dates spread realistically over 3 years, format "Yelping since" | Already the project's date library (used in hours/open-now logic) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@faker-js/faker` [ASSUMED — see Package Legitimacy Audit] | 10.6.0 | Deterministic (seeded via `faker.seed(n)`) generation of user names, cities, emails | Only for structured fields (names/cities), never for review body text — `faker.lorem` produces generic lorem-ipsum, not rating-appropriate sentiment text |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@faker-js/faker` for names/cities | Hand-rolled name/city arrays | Faker is well-maintained, MIT-licensed, 12M weekly downloads, and `faker.seed()` gives full determinism — a hand-rolled array works too but faker saves authoring ~200 realistic Sri Lankan/English first+last name combinations by hand. Given the project already avoids adding dependencies where a few lines of code suffice (Phase 4 used `crypto` hash over a random-sampling library), this is a **judgment call for the planner**, not a forced choice — flagged in Assumptions Log. |
| `@dicebear/*` for user avatars | Hand-rolled SVG "initials" avatar generator via existing `sharp` dependency | `@dicebear/core` returned a `SUS` legitimacy verdict (see audit below — likely a false positive on "too-new" since it has 297K weekly downloads and a 2019-era GitHub repo, but must still be gated). Given seeded users are named "Firstname L." (spec §3 item 4), a **generated initials avatar (no new dependency, no real human faces)** is both cheaper and avoids the ethical problem of attaching real strangers' stock-photo faces to fake written reviews. **Recommended: hand-rolled initials avatar, not DiceBear.** |
| Pexels/Pixabay live fetch | Bundled curated static image set checked into git | Recommended approach IS to fetch once and commit — see `## Common Pitfalls` Pitfall 1 for why fetching at every `prisma db seed` run is wrong |

**Installation:**
```bash
npm install @faker-js/faker
# No other new runtime dependencies required — sharp, luxon, zod already present.
```

**Version verification:** `npm view @faker-js/faker version` → `10.6.0`, published 2026-08-14, MIT license, repo `github.com/faker-js/faker`, 12,422,052 weekly downloads [VERIFIED: npm registry — confirmed via `npm view` and `gsd-tools package-legitimacy check`, verdict `OK`]. Per this agent's package-name-provenance rule, the package **name itself** was supplied from training knowledge, not an official-docs/Context7 lookup, so it is tagged `[ASSUMED]` in the Standard Stack table above despite the clean registry check — see Assumptions Log A1.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `@faker-js/faker` | npm | actively maintained since 2022 (fork of deprecated `faker.js`); latest publish 2026-08-14 | 12,422,052/wk | github.com/faker-js/faker | OK | Approved |
| `@dicebear/core` | npm | latest publish 2026-08-26 | 297,391/wk | github.com/dicebear/dicebear | SUS (`too-new` heuristic) | **Not recommended** — see Alternatives Considered. If the planner chooses avatars over hand-rolled initials anyway, gate the install behind `checkpoint:human-verify` |
| `@dicebear/collection` | npm | latest publish 2026-03-19 | 144,890/wk | github.com/dicebear/dicebear | OK | Not needed if `@dicebear/core` is skipped |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `@dicebear/core` — recommendation is to avoid it entirely (hand-rolled initials avatar instead), so no `checkpoint:human-verify` task should be needed unless the planner deliberately chooses the DiceBear path.

## Architecture Patterns

### System Architecture Diagram

```
                     ┌─────────────────────────────┐
  (dev-run, once)    │  scripts/fetch-seed-images.ts│
  Pexels/Pixabay API │  (NOT part of `prisma db seed`)
        │            └──────────────┬──────────────┘
        ▼                           ▼
  category search query      /public/seed/{category}/*.jpg
                              (committed to git)
                                     │
                                     ▼
┌──────────────────┐   reads    ┌─────────────────────────┐
│ businesses.json   │───────────▶│                          │
│ (existing, edited)│            │                          │
├──────────────────┤   reads    │   prisma/seed.ts          │
│ reviews-data      │───────────▶│   (validateAll →          │
│ generator module  │            │    single $transaction)   │
├──────────────────┤   reads    │                          │
│ users-data        │───────────▶│                          │
│ generator module  │            │                          │
├──────────────────┤   reads    │                          │
│ qa-data generator │───────────▶│                          │
└──────────────────┘            └──────────┬───────────────┘
                                            ▼
                                   Postgres (Business,
                                   Review, User, Question,
                                   Answer, BusinessPhoto,
                                   ReviewPhoto — isTest=false)
                                            │
                    ┌───────────────────────┼────────────────────────┐
                    ▼                       ▼                        ▼
          lib/search/run-search-query   app/api/businesses/[slug]   lib/home/load-rails
          lib/search/business-open-now  (+ questions/reviews/photos (+ business-card-props)
          (add isTest:false to WHERE)    sub-routes; add isTest:false)  (add isTest:false)
                    │                       │                        │
                    ▼                       ▼                        ▼
              /search, /directory      /business/[slug]         / (home rails)
```

### Recommended Project Structure
```
prisma/
├── schema.prisma                    # + isTest, eliteYear, guaranteed, responseTime,
│                                     #   responseRate, PhotoTag enum, BusinessPhoto.tag,
│                                     #   ReviewPhoto.tag (optional)
├── seed.ts                          # orchestrates: businesses → users → reviews → votes
│                                     #   → review photos → Q&A, all in one $transaction
├── seed-data/
│   ├── businesses.json              # existing 107 rows — add guaranteed/responseTime/
│   │                                #   responseRate to a realistic subset
│   ├── users.json                   # NEW — 60+ generated once, committed (not regenerated
│   │                                #   live), output of a one-time generator script
│   ├── review-sentence-banks.ts     # NEW — category × rating-tier sentence fragments
│   └── generators/
│       ├── generate-reviews.ts      # NEW — pure function: (business, users, rng seed) →
│       │                            #   Review[] rows, 5-60 per business
│       ├── generate-qa.ts           # NEW — 0-5 Q&A threads per business
│       └── generate-users.ts        # NEW — one-time script, output committed to users.json
scripts/
└── fetch-seed-images.ts             # NEW — dev-run-once, calls Pexels/Pixabay, writes to
                                      #   /public/seed/{category}/*.jpg, never run by CI/seed
public/
└── seed/
    ├── restaurant/*.jpg
    ├── cafe-bakery/*.jpg
    ├── ...(one dir per leaf category slug)
    └── avatars/*.svg                # generated initials avatars, or omit dir if inlined
```

### Pattern 1: Deterministic, offline generator modules (not inline in seed.ts)
**What:** Each content type (reviews, Q&A) gets its own pure-function generator module that
takes a seeded RNG and returns plain data objects — no Prisma calls inside the generator.
`seed.ts` stays the single place that talks to the database, matching its existing
`validateAll` → `$transaction` structure.
**When to use:** Any time seed content volume is data-driven (5-60 reviews/business,
0-5 Q&A/business) rather than a fixed JSON list.
**Example:**
```typescript
// prisma/seed-data/generators/generate-reviews.ts
// Source: pattern derived from this repo's own prisma/seed.ts validateAll structure
import { faker } from "@faker-js/faker";

export interface GeneratedReview {
  userId: string;
  rating: number;
  text: string;
  visitDate: string; // ISO date, spread over ~3 years
  photoCount: number; // 0-3
}

export function generateReviewsForBusiness(
  businessSlug: string,
  userPool: { id: string }[],
  count: number, // 5-60, caller decides via seeded RNG
): GeneratedReview[] {
  faker.seed(hashSlugToSeed(businessSlug)); // deterministic per business, reruns identical
  // rating distribution skewed 3-5: weight [1,1,2,4,5] for stars [1,2,3,4,5]
  // ... composition of review-sentence-banks.ts fragments by rating tier + category
}
```

### Pattern 2: `isTest` as a mandatory WHERE clause, not an afterthought
**What:** Every `prisma.business.findMany/findFirst`, `prisma.review.findMany`, and any
future `prisma.user.findMany` used for a public-facing list MUST add `isTest: false`
(or `AND NOT isTest` in raw SQL) to its `where`.
**When to use:** All of: `lib/search/run-search-query.ts`, `lib/search/business-open-now.ts`,
`lib/home/load-rails.ts`, `app/api/businesses/[slug]/route.ts` and its
`photos`/`questions`/`reviews` sub-routes, `app/api/listings/route.ts`,
`app/api/collections/[id]/items/route.ts`. [VERIFIED: codebase grep — this is the exhaustive
list of non-generated files calling `prisma.business.find*`/`prisma.review.find*` as of this
research date.]
**Example:**
```typescript
// lib/search/run-search-query.ts — add to existing WHERE construction
const rows = await prisma.$queryRaw`
  SELECT * FROM "Business"
  WHERE "isTest" = false
    AND ...(existing tsvector/geo/filter conditions)
`;
```

### Anti-Patterns to Avoid
- **Calling Pexels/Pixabay/an LLM API inside `prisma/seed.ts`:** breaks the project's
  established idempotent-offline-seed contract (T-04-01/T-04-03 in `seed.ts`'s own comments)
  and makes `prisma db seed` non-deterministic and network-dependent. Fetch/generate once,
  commit the output, seed reads only local files — exactly how `businesses.json` already works.
- **Filtering `isTest` in the UI layer instead of the query layer:** e.g. rendering a
  business card but hiding it with CSS, or filtering an already-fetched array in a Server
  Component. This still ships test data over the wire and defeats DATA-03's "excluded from
  every UI surface" requirement; filter in the Prisma `where`.
- **Reusing `picsum.photos` URLs as a migration fallback:** the whole point of DATA-04 is
  zero `picsum.photos` references; don't leave a partial migration where some businesses
  still point at picsum because a category ran out of curated images — use the initials-style
  SVG fallback (see Pitfall 3) instead, never a remote placeholder service.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Realistic name/city/email generation | Hand-written arrays of 60+ names | `@faker-js/faker` with `faker.seed(n)` | Determinism is built in (`faker.seed()` resets the sequence identically every run); avoids a tedious hand-authored fixture that will look repetitive at only ~20-30 hand-picked names |
| Rating-distribution sampling (skewed 3-5 stars) | A hand-rolled `Math.random()` bucket picker re-derived per file | One shared weighted-sample helper (e.g. `[1,1,2,4,5]` cumulative weights for stars 1-5), same helper used by both review generation and any future re-seed | Keeps the "skewed 3-5" distribution consistent and testable in one place instead of drifting between review/Q&A/vote generators |
| Image resizing/format validation | New image library | `sharp` (already a dependency, already used by `classifyPhoto` in Phase 5) | No new dependency; `sharp` already proven in this codebase for exactly this class of problem |

**Key insight:** This phase's "hand-roll risk" is not in complex algorithms — it's in
under-engineering the generator modules as one giant procedural script inside `seed.ts`
instead of small, independently testable pure functions. The existing `businessSeedSchema`
`.strict()` + `validateAll` pattern already proves the value of validate-before-write; extend
it, don't bypass it, for reviews/users/Q&A.

## Common Pitfalls

### Pitfall 1: Fetching stock images at `prisma db seed` runtime instead of once, offline
**What goes wrong:** If image fetching lives inside `seed.ts` or is triggered by
`npm run db seed`, every teammate's local seed run (and every CI run, if seeding is ever
automated) makes ~350 external HTTP calls, burns API quota, and produces non-reproducible
results if Pexels/Pixabay search results change over time.
**Why it happens:** It's tempting to fold "get the images" into the same script that "uses
the images" since they're conceptually related.
**How to avoid:** Two separate scripts. `scripts/fetch-seed-images.ts` is a **developer-run,
one-time (or run-when-adding-a-category) tool** that writes to `/public/seed/` and is
committed to git like any other asset. `prisma/seed.ts` only ever reads local file paths
already committed to the repo — it has zero network dependency, matching every other seed
input in this codebase.
**Warning signs:** A `fetch(...)` or API-key env var inside `prisma/seed.ts` itself.

### Pitfall 2: The Sixth Prisma migrate trap — DROP INDEX / DROP DEFAULT stripping
**What goes wrong:** `prisma migrate dev --create-only` will auto-generate `DROP INDEX` for
`Business_location_gist` and `business_name_trgm_idx` (both raw, non-`@@index`-managed DDL)
and `ALTER COLUMN "searchable" DROP DEFAULT` on the generated tsvector column, because
Prisma's diff engine treats hand-added raw SQL as unmanaged drift. This has happened and been
manually fixed in **every migration so far**: `20260913160103_init` era (Phase 1),
`20260915000009_add_search_and_auth` (Phase 2), `add_reviews` (Phase 3), voting/claim
migration (Phase 4), `20260916000017_add_photos_qa_collections` (Phase 5) [VERIFIED: codebase
read — `prisma/migrations/20260916000017_add_photos_qa_collections/migration.sql`'s own
header comment documents this exact pattern for the fourth+fifth time].
**Why it happens:** `location` (PostGIS `geography` type) and `searchable` (`tsvector`) are
`Unsupported(...)` Prisma types with hand-written raw SQL indexes — Prisma's schema diff has
no visibility into indexes it didn't create.
**How to avoid:** Run `prisma migrate dev --create-only`, open the generated
`migration.sql`, delete the auto-generated `DROP INDEX "Business_location_gist"`,
`DROP INDEX "business_name_trgm_idx"`, and `ALTER COLUMN "searchable" DROP DEFAULT`
statements (add a header comment noting this is the sixth occurrence, following the existing
convention), then `prisma migrate dev` to apply.
**Warning signs:** Any generated migration for this phase that contains the string
`DROP INDEX` or `DROP DEFAULT` referencing `location`, `searchable`, `Business_location_gist`,
or `business_name_trgm_idx`.

### Pitfall 3: Running out of category-appropriate stock photos for niche categories
**What goes wrong:** Common categories (`restaurant`, `beauty-spa`) have abundant Pexels/
Pixabay results; Sri Lanka-specific leaf categories (`tuk-repair`, `tailoring`,
`wedding-vendors`) may return few or generic/irrelevant results for a literal keyword search
(e.g. "tuk tuk repair" yields almost nothing on Western-sourced stock libraries).
**Why it happens:** Pexels/Pixabay's catalogs skew toward Western/generic commercial imagery;
Sri Lanka-specific informal-sector categories are exactly this project's differentiator
(per PROJECT.md) and exactly the categories least represented in global stock libraries.
**How to avoid:** For each of the 16 leaf categories, search 2-3 keyword variants (broader
parent-category terms as fallback, e.g. "auto repair shop" / "mechanic garage" /
"vehicle service" for `tuk-repair`) and accept a broader-but-still-plausible match rather than
a literal one. For any category that still comes up short of what's needed, use a **generated
category-icon placeholder** (a simple colored panel + Lucide icon already in this codebase's
dependency tree, rendered via `sharp`'s SVG rasterization) rather than an irrelevant or
picsum-style stock photo — this is explicitly better than the current bug ("a gym shows a
coffee cup") per the source spec's own framing.
**Warning signs:** Any category directory in `/public/seed/` with fewer images than needed
to cover that category's business count × photo-count target.

### Pitfall 4: Seed review text that violates the existing `reviewCreateSchema` constraints
**What goes wrong:** `lib/validation/review.schema.ts` enforces `text: z.string().min(50).max(5000)`
[VERIFIED: codebase grep]. A generator that occasionally produces very short (<50 char)
composed sentences, or that accidentally emits duplicate/near-duplicate text across many
reviews (a template-composition failure mode), technically satisfies the DB write (seed uses
Prisma directly, not the API route) but produces content that would be rejected if it ever
went through the real create-review flow, and duplicate/near-duplicate text is exactly the
signal `lib/reviews/gather-review-signals.ts`'s text-similarity check would flag as
`not_recommended` in Phase 3's review filter — seeding reviews that would fail their own
platform's spam filter undermines DATA-06's "realistic" goal.
**Why it happens:** Sentence-bank composition with too small a fragment pool repeats phrases
across businesses.
**How to avoid:** (1) Run generated review text through the *same* Zod schema the API uses
(reuse `reviewCreateSchema`, don't hand-roll a parallel one) as part of `validateAll`. (2) Size
the sentence-bank pool so that composed 80-400 word reviews have low collision probability —
combine an opening clause, 2-4 body clauses, and a closing clause each drawn from ≥15-20
category-and-rating-tier-specific options, giving thousands of combinations, not dozens.
**Warning signs:** Two reviews on different businesses sharing an identical sentence.

### Pitfall 5: Forgetting `ReviewVote` rows when setting denormalized vote counts
**What goes wrong:** `Review.usefulCount`/`funnyCount`/`coolCount` are denormalized fields
"recomputed in the same transaction as each toggle" per the Phase 4 decision log
[VERIFIED: schema.prisma comment + STATE.md Phase 4 decisions]. If seed data sets these
integers directly without creating backing `ReviewVote` rows, the data is inconsistent with
every other write path in the app, and any future feature that queries "who voted" (or a
regression test asserting `COUNT(ReviewVote) == Review.usefulCount`) will fail against seeded
data specifically.
**How to avoid:** Create real `ReviewVote` rows from the 60+ seeded users (respecting the
`@@unique([reviewId, userId, kind])` constraint and the existing "no self-vote" business rule
by never having a review's own author vote on their own review), and derive
`usefulCount`/`funnyCount`/`coolCount` by counting them — don't set the integers independently
of the rows.
**Warning signs:** `Review.usefulCount > 0` with zero matching `ReviewVote` rows for that
review.

## Code Examples

### `generateMetadata` for a dynamic business page (Next.js App Router, current version)
```typescript
// Source: nextjs.org/docs/app/api-reference/functions/generate-metadata [CITED]
// app/business/[slug]/page.tsx
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessDetail(slug); // existing loader, already used by the page
  if (!business) return {}; // falls back to root layout's generic title on 404
  const month = /* format business.updatedAt as "Month YYYY" via luxon */;
  return {
    title: `${business.name} - Updated ${month} - ${business.photos.length} Photos & ${business.reviewCount} Reviews - ${business.district} - ${getCategoryLabel(business.primaryCategories[0])} - LankaReview`,
  };
}
```
Root cause note: [VERIFIED: codebase read] `app/layout.tsx` already defines
`export const metadata = { title: "LankaReview", ... }` — the browser tab is NOT currently
literally "localhost" (that claim in `docs/lankareview-full-yelp-clone-prompt.md` reflects an
earlier/different crawl). The real gap is that **zero pages** under `app/` currently export
`generateMetadata` [VERIFIED: `grep -rl "generateMetadata" app/` returns nothing], so every
page silently inherits the same generic root title instead of the per-page dynamic titles
DATA-10 and the spec require.

### Deterministic faker seeding per entity
```typescript
// Source: github.com/faker-js/faker README [CITED]
import { faker } from "@faker-js/faker";

function seededUser(index: number) {
  faker.seed(1000 + index); // stable across every seed re-run
  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()[0]}.`, // "Firstname L."
    city: faker.helpers.arrayElement(["Colombo", "Kandy", "Galle", "Negombo", "Nugegoda"]),
  };
}
```
Note: `faker.seed(n)` mutates Faker's shared singleton — seed once per deterministic unit
(per-user index here), not globally once for the whole script, or every user after the first
call to `faker.seed()` in a loop will silently reuse the same sequence position drift pattern
documented in Faker's own "Reproducible Results" docs.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `source.unsplash.com` random-image-by-keyword URLs | Full Unsplash API (`api.unsplash.com`, requires app approval + attribution) or Pexels/Pixabay (no approval needed) | Unsplash Source deprecated 2021, fully shut down 2024 [CITED: unsplash.com/documentation/changelog] | Rules out the "just hotlink a random Unsplash URL by keyword" approach some older tutorials still reference — must use a real API key + one-time fetch, not a URL pattern |

**Deprecated/outdated:**
- `picsum.photos` as a seed-image source: this project's own Phase 1 decision already
  documents this as a deliberate, temporary, zero-infra choice ("no infra cost, no account
  needed") — DATA-04 is this project retiring its own Phase 1 shortcut, not reacting to an
  external deprecation.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@faker-js/faker` is the right library for deterministic name/city/email generation | Standard Stack, Code Examples | Low — registry check (`npm view`, `package-legitimacy check`) returned clean signals (MIT, 12M weekly downloads, real GitHub repo); if the planner/user prefers zero new dependencies, a hand-rolled name-array is a trivial substitute with no architectural impact |
| A2 | Pexels is the primary image source (Pixabay as secondary/overflow) rather than the reverse, or a paid stock library | Common Pitfalls Pitfall 1/3, Summary | Low-Medium — both are genuinely free/no-attribution-required for commercial use per their own terms pages fetched this session; the only real risk is category coverage for Sri Lanka-specific niches (tuk-repair, tailoring), addressed in Pitfall 3, not a legal/cost risk |
| A3 | `BusinessPhoto.tag` (and optionally `ReviewPhoto.tag`) should be a new nullable enum field, not a free-text string | Architecture Patterns, Don't Hand-Roll | Medium — REQUIREMENTS.md's DATA-07 wording ("seeded photos carry a tag food\|inside\|outside\|menu\|drink\|video") is closed-vocabulary, strongly suggesting an enum, but doesn't explicitly say "enum field on BusinessPhoto"; if the planner decides ReviewPhoto also needs a tag (Phase 9's photo-lightbox tabs may want to merge business + review photos into one tagged grid), this should be raised explicitly rather than assumed — flagged as an Open Question below |
| A4 | Hand-rolled SVG-initials avatars are preferable to `@dicebear/core` for the 60+ seeded users | Alternatives Considered, Package Legitimacy Audit | Low — this is a judgment call weighing "no new SUS-flagged dependency + no real-face ethics concern" against "DiceBear is purpose-built and saves implementation time"; either choice satisfies DATA-09's literal "avatar" requirement |
| A5 | `guaranteed`/`responseTimeMinutes`/`responseRate` should be populated for a realistic minority subset of seeded businesses (not all, not none) | Summary, Architecture Patterns | Low — DATA-01's literal requirement is schema-only ("Business schema has..."); the "ready for Phase 9 to read" success criterion implies non-empty data is useful but doesn't mandate a specific coverage percentage — planner should confirm target % with the user during discuss-phase if precision matters |

**If this table is empty:** N/A — see rows above.

## Open Questions

1. **Does `ReviewPhoto` need a `tag` field, or only `BusinessPhoto`?**
   - What we know: The source spec (§3.3) and DATA-07 both describe tagging in the context of
     the business photo gallery ("5-40 photos tagged..."); Success Criterion #3 for this
     phase separately mentions reviews "carrying 1-3 photos" without mentioning tags on those
     specifically.
   - What's unclear: Whether Phase 9's photo lightbox (BIZPAGE-04, a future phase) will need a
     unified tag filter across BusinessPhoto + ReviewPhoto, which would mean adding the field
     to both now to avoid a second migration later.
   - Recommendation: Add `tag` as nullable on `BusinessPhoto` (required for DATA-07 seed data)
     and also add it (nullable, unused by seed for now) on `ReviewPhoto` in the same migration
     — it's a one-line schema addition now vs. a second migration in Phase 9 if the need
     turns out to be real. Flag this as a discuss-phase confirmation point, not a blocking
     unknown.

2. **Exact response-time representation for `responseTime`**
   - What we know: Yelp's own UI shows this as prose ("responds in about 10 minutes") built
     from an underlying numeric value; DATA-01 only requires the field to exist.
   - What's unclear: Whether the planner should model `responseTimeMinutes: Int?` (numeric,
     formatted at render time in Phase 9) or a pre-formatted `responseTimeLabel: String?`.
   - Recommendation: Numeric (`responseTimeMinutes Int?`) — keeps formatting/localization logic
     in the UI layer (Phase 9, which already owns i18n via `lib/i18n/messages.ts`) rather than
     baking English prose into seed data that also needs Sinhala/Tamil variants eventually.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | seed scripts, image-fetch script | ✓ | v24.8.0 | — |
| `npm view` / npm registry access | Package legitimacy verification | ✓ | — | — |
| Pexels API key | Image sourcing (primary) | Not yet provisioned — free signup required | — | Pixabay (also free, no key-approval wait beyond signup) |
| Pixabay API key | Image sourcing (secondary/overflow) | Not yet provisioned — free signup required | — | Category-icon SVG placeholder (Pitfall 3) |
| Local Postgres + PostGIS (Docker) | Running the migration + seed | Assumed available per Phase 1 setup (`docker-compose.yml`, `platform: linux/amd64` pin) — not re-verified this session | — | — |

**Missing dependencies with no fallback:**
- None — every external dependency (Pexels/Pixabay keys) has a documented fallback path.

**Missing dependencies with fallback:**
- Pexels/Pixabay API keys are not yet in `.env` — the planner should add a task to obtain
  free-tier keys and add `PEXELS_API_KEY`/`PIXABAY_API_KEY` to `.env.example` before the
  image-fetch script task, or gate that task behind a `checkpoint:human-verify` if key
  provisioning can't happen unattended.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.0 (unit/integration), Playwright 1.63.0 (e2e) — both already configured [VERIFIED: package.json] |
| Config file | `vitest.setup.ts` (loads `dotenv/config` for `OTP_HMAC_SECRET`/`SESSION_SECRET`), Playwright config not read this session but referenced by `npm run test:e2e` |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test && npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-03 | `isTest:false` filter applied on every business/review/user read path | unit/integration | `vitest run lib/search/run-search-query.test.ts lib/home/load-rails.test.ts` (extend existing suites with an `isTest:true` fixture that must never appear) | ❌ Wave 0 — new assertions needed in existing test files |
| DATA-04 | No `picsum.photos` URL appears in any seeded `BusinessPhoto.url` | unit | New test: assert `businessesData.every(b => b.photos.every(p => !p.url.includes("picsum")))` | ❌ Wave 0 |
| DATA-05 | Category chips render human labels, not slugs | unit (existing pattern) | `vitest run components/business/business-page.test.tsx` (extend `mockBusiness` assertion already present at line 107 to also check the rendered badge text, not just breadcrumb) | ❌ Wave 0 — extend existing test |
| DATA-06 | Every seeded business has 5-60 reviews, 80-400 words, dates over 3 years | unit | New test over generator output: `generateReviewsForBusiness` word-count/date-range assertions | ❌ Wave 0 |
| DATA-07 | Vote counts and photo tags present and consistent | unit | New test: `ReviewVote` count matches denormalized `usefulCount`/`funnyCount`/`coolCount` per review | ❌ Wave 0 |
| DATA-08 | 0-5 Q&A threads per business with answers | unit | New test over `generate-qa.ts` output | ❌ Wave 0 |
| DATA-09 | 60+ users with avatar/name/city/counts/eliteYear | unit | `expect(usersData.length).toBeGreaterThanOrEqual(60)` + per-field presence checks | ❌ Wave 0 |
| DATA-10 | `generateMetadata` on home/search/business pages, no "localhost" | e2e (Playwright) | New e2e assertion on `page.title()` for `/`, `/search?...`, `/business/[slug]` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test` (fast unit/integration subset covering the touched file)
- **Per wave merge:** `npm test && npm run test:e2e`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `prisma/seed-data/generators/generate-reviews.test.ts` — word-count, date-spread,
      rating-distribution assertions
- [ ] `prisma/seed-data/generators/generate-qa.test.ts` — 0-5 threads per business
- [ ] `lib/search/run-search-query.test.ts` — extend with an `isTest:true` fixture that must
      never appear in results
- [ ] `lib/home/load-rails.test.ts` — same `isTest` exclusion assertion for rails
- [ ] `components/business/business-page.test.tsx` — extend to assert rendered badge text
      uses `getCategoryLabel`, not the raw slug, for both primary and secondary category chips
- [ ] `e2e/` — new spec asserting page `<title>` for `/`, `/search`, `/business/[slug]` is
      never the literal string `"localhost"` and matches the spec's format pattern

*(No existing test infrastructure gap for the framework itself — Vitest/Playwright are
already fully configured; gaps are entirely new test files for new behavior.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase adds no new auth surface |
| V3 Session Management | No | Phase adds no new session surface |
| V4 Access Control | Partial | `isTest` filtering is a data-segregation control, not classic authZ, but functions the same way: every read path must enforce it server-side (Prisma `where`), never client-side |
| V5 Input Validation | Yes | Extend `.strict()` Zod schemas (matching `businessSeedSchema`) to the new review/user/Q&A seed inputs; reuse the existing `reviewCreateSchema`/`question.schema.ts` constraints for generated text rather than a parallel schema |
| V6 Cryptography | No | No new secrets/crypto surface |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Test-fixture data (`isTest:true` rows) leaking into a public search/browse/business-detail surface | Information Disclosure | Enforce `isTest: false` in the Prisma `where` at every read call site (see Architecture Pattern 2's exhaustive file list), never filter post-fetch in a component |
| Seeded review text colliding with the existing text-similarity spam-filter signal (Phase 3's `gather-review-signals.ts`) if the seed script ever routes through the real create-review API instead of direct Prisma writes | Tampering (data-integrity, not malicious) | Seed writes go directly via `prisma.review.create`/`createMany` inside the existing `$transaction`, never through `POST /api/reviews` — this also means seed data correctly bypasses REV-03's filter (seeded reviews should presumably all be `visibilityStatus: "recommended"` by construction, not run through the filter engine) |

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma`, `prisma/seed.ts`, `lib/validation/business.schema.ts`,
  `lib/validation/review.schema.ts`, `lib/categories/category-config.ts`,
  `components/business/business-page.tsx`, `app/layout.tsx`, `next.config.ts`,
  `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/PROJECT.md`,
  `docs/lankareview-full-yelp-clone-prompt.md` — all read directly this session
- `prisma/migrations/20260916000017_add_photos_qa_collections/migration.sql` — confirms the
  DROP INDEX/DROP DEFAULT trap pattern directly from repo history
- `npm view @faker-js/faker` / `gsd-tools package-legitimacy check` — registry + legitimacy
  signals fetched this session

### Secondary (MEDIUM confidence)
- nextjs.org `generateMetadata` docs (via WebSearch, official domain) [CITED]
- pexels.com/api/documentation, pexels.com/terms-of-service, help.pexels.com articles (via
  WebSearch, official domain) [CITED]
- pixabay.com/service/terms, pixabay.com/api/docs (via WebSearch, official domain) [CITED]
- github.com/faker-js/faker README (via WebSearch, official repo) [CITED]

### Tertiary (LOW confidence)
- General WebSearch results on non-LLM synthetic review-text generation approaches (n-gram/
  template methods) — used only to confirm template/sentence-bank composition is a recognized,
  non-exotic approach, not to source a specific library or exact algorithm

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — core tools (Prisma/Zod/sharp/luxon) are HIGH confidence (already
  in this codebase); the one new dependency (`@faker-js/faker`) is tagged ASSUMED per this
  agent's provenance rule despite clean registry signals
- Architecture: HIGH — every architectural claim (which files read Business/Review/User,
  where the metadata gap is, where the category-slug bug is) is verified directly against
  this codebase, not inferred
- Pitfalls: HIGH — Pitfall 2 (migration trap) is documented five times already in this
  project's own history; Pitfalls 4-5 are derived directly from this codebase's existing
  validation schemas and denormalized-count conventions

**Research date:** 2026-09-24
**Valid until:** 2026-10-24 (30 days — stable domain: internal schema/seed conventions don't
drift; the one external-API-dependent finding, Pexels/Pixabay terms, should be re-checked if
this phase isn't executed within ~30 days since free-tier API terms can change)
