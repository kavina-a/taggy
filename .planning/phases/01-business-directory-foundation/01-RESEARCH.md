# Phase 1: Business Directory Foundation - Research

**Researched:** 2026-09-13
**Domain:** Full-stack Next.js directory app on Postgres+PostGIS — geo/address modeling, structured business hours, category-conditional jsonb attributes, low-bandwidth map rendering, manual seed data pipeline
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (Platform Surface):** Phase 1 ships web only. React Native mobile app is
  deferred to a later phase, once the API this phase establishes is stable. (Backend
  stack is still Node.js/TypeScript per PROJECT.md; specific web framework choice, e.g.
  Next.js, is left to the phase researcher/planner to recommend — not locked by the user.)
- **D-02 (Category Attributes):** Business attributes are stored as a single flexible
  `jsonb` column on `businesses`, not fixed typed columns. A small per-category config
  (table or static config file) defines which attribute keys/types are valid/expected for
  each category, so adding a new attribute or category later doesn't require a schema
  migration.
- **D-03 (Menu Representation):** For v1, a restaurant's "menu tab" is a pinned photo
  gallery only (per LIST-04's literal wording) — no structured `MenuItem`
  (name/price/description) entity yet. Do not build MenuItem tables/relations in this
  phase.
- **D-04 (Seed Data Sourcing):** The Colombo starter dataset (LIST-06) is manually
  curated — hand-compiled, not scraped or pulled from OpenStreetMap. Target ~100-300 real,
  well-known Colombo businesses spanning the seeded category taxonomy (LIST-05), including
  the locally-distinct categories (tuk repair, tutoring, wedding vendors, tailoring).

### Claude's Discretion

- Exact web framework (Next.js vs. alternatives), ORM/query layer choice, and how the
  per-category attribute config is physically stored (JSON config file vs. a
  `category_attributes` table) are left to research/planning — the user did not express a
  preference beyond "Node.js/TypeScript backend."
- Exact seed dataset size within the ~100-300 range and which specific businesses to
  include are Claude's discretion, guided by covering the full category taxonomy rather
  than clustering in one vertical (e.g. don't seed 200 restaurants and 5 everything else).

### Deferred Ideas (OUT OF SCOPE)

- React Native mobile app — explicitly deferred past Phase 1; revisit once the Phase 1/2
  API is stable.
- Structured `MenuItem` entity (name/price/description) — deferred past v1; likely
  candidate for a future business-dashboard phase.
- OpenStreetMap-based or scraped seed data pipeline — not chosen for Phase 1, but could be
  worth revisiting once the manually-curated list needs to scale beyond Colombo to other
  cities.
</user_constraints>

## Project Constraints (from CLAUDE.md)

CLAUDE.md's `Project` section mirrors PROJECT.md verbatim and adds no directives beyond
it. Relevant constraints the planner must honor:

- **Bootstrap budget:** Favor free/cheap tiers over paid managed services until Phase 2
  revenue exists — directly informs the Leaflet/OpenStreetMap (not Google Maps) and
  Neon/Supabase-free-tier-or-self-hosted (not a paid managed Postgres) recommendations
  below.
- **Tech stack:** Node.js/TypeScript backend, Postgres+PostGIS as source of truth
  (React Native and OpenSearch are named too, but are out of scope for this web-only,
  no-search Phase 1).
- **Workflow enforcement:** CLAUDE.md requires all file-changing work to go through a GSD
  entry point (`/gsd-execute-phase`, `/gsd-quick`, `/gsd-debug`) — not a research-phase
  concern, but the planner should be aware no direct repo edits are expected outside that
  flow.
- No project-specific coding conventions, architecture docs, or skills exist yet
  (`STACK.md`, `CONVENTIONS.md`, `ARCHITECTURE.md` are all placeholder/unpopulated, and no
  `.claude/skills/` or `.agents/skills/` directory exists) — this phase establishes those
  patterns for later phases to follow.

## Summary

Phase 1 is a greenfield build with no code yet. The UI-SPEC has already locked Next.js
(App Router, TypeScript, Tailwind v4, shadcn `new-york`/`neutral`) as the frontend, and
PROJECT.md has locked Node.js/TypeScript + Postgres/PostGIS as the backend data layer.
The open questions left to this phase's discretion (ORM, config storage mechanism,
monolith-vs-split-backend, hours modeling, map rendering, seed pipeline) all have a
single well-supported answer for a solo/bootstrap team building an MVP: **keep everything
in one Next.js app, use Prisma against Postgres with a deliberately simple geo strategy
(plain float lat/lng columns + a synced PostGIS `geography` column for future search
phases), model hours as two small relational tables instead of jsonb, render the map with
free Leaflet+OpenStreetMap tiles, and seed via a validated, idempotent `prisma db seed`
script reading a hand-curated JSON file.**

None of these choices require paid infrastructure. Postgres+PostGIS is available for free
via Neon's or Supabase's free tier (both confirmed to bundle the PostGIS extension), and
locally via the official `postgis/postgis` Docker image. The riskiest technical corner in
this phase is **not** the stack choice — it's correctly modeling "open now" for a business
whose hours cross midnight (e.g., a bar open 6pm–2am) and combining that with one-off
holiday overrides without producing an off-by-one-day bug. That gets its own pitfall
section below, because it is the one place research found genuine domain complexity (as
opposed to well-trodden stack-selection questions).

**Primary recommendation:** Single Next.js 16 app (Route Handlers + Server Components,
no separate backend service) + Prisma 7 ORM + Postgres 16 with the PostGIS extension
enabled + Leaflet/OpenStreetMap for the map pin + a static TypeScript config file (not a
DB table) for per-category attribute definitions + two relational tables
(`business_hours`, `business_hours_overrides`) for hours, not a jsonb hours blob + a
`prisma/seed.ts` script driven by a hand-curated `seed-data/businesses.json` file,
validated with Zod before upsert.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIST-01 | Business listing with name, up to 3 primary + unlimited secondary categories, description, district/DS-division + free-text address (no ZIP), lat/lng | Standard Stack (Prisma schema), Architecture Patterns (dual lat/lng + geography column), Code Examples (address/category model) |
| LIST-02 | Structured 7-day hours, split shifts, holiday overrides, computed "Open now"/"Closed" | Common Pitfalls (overnight-hours + holiday-override bug), Code Examples (hours schema + open-now algorithm) |
| LIST-03 | Category-conditional attributes (jsonb) | Standard Stack (Zod), Architecture Patterns (static config + jsonb validation) |
| LIST-04 | Photo gallery + restaurant menu tab (photos only) | Architecture Patterns (photo storage), Don't Hand-Roll (image handling via next/image) |
| LIST-05 | Category taxonomy seeded, Sri Lanka-relevant leaf categories | Standard Stack (static config file holds taxonomy), Seed pipeline section |
| LIST-06 | Seeded real Colombo starter dataset (~100-300 businesses) | Seed Data Pipeline (Code Examples, Common Pitfalls) |
| LOC-02 | Address model: district/DS-division + free text + lat/lng, never ZIP | Architecture Patterns (address model), Code Examples |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Business profile read (name, categories, description, address) | API/Backend (Next.js Route Handlers / Server Components) | Database (Postgres) | Server Components fetch directly via Prisma at request time; no separate API service needed for a monolith |
| Category taxonomy + per-category attribute schema | Frontend Server (static TS config bundled at build time) | API/Backend (validation at write time) | No admin UI exists in Phase 1 to edit categories dynamically — a code-deployed config is simpler and type-safe |
| Address & geo storage (district/DS-division, free text, lat/lng) | Database (Postgres + PostGIS) | API/Backend (serialization to JSON for the client) | Source of truth must be the DB; app layer only formats it |
| Hours storage + "Open now" computation | API/Backend (computed server-side per request/render) | Browser/Client (optional live re-check on an interval) | Server has authoritative timezone (Asia/Colombo) and current time; client-only computation risks device-timezone bugs |
| Photo gallery & menu (restaurant) photos | CDN/Static (Next.js Image + object storage) | API/Backend (photo metadata rows: url, caption, sort order) | Binary storage and image transforms belong at the edge/CDN layer, not the app server |
| Map pin rendering | Browser/Client (Leaflet map component) | CDN/Static (OpenStreetMap tile servers, external) | Interactive map only makes sense client-side; tiles are fetched from an external free CDN |
| Directory index (browsable list/grid) | Frontend Server (Next.js Server Components, SSR/SSG) | Database (Postgres, paginated query) | SEO-relevant surface per UI-SPEC — must be server-rendered, not client-fetched |
| Seed data ingestion (~100-300 businesses) | API/Backend (one-off `prisma db seed` script) | Database (target of the upserts) | Not a runtime capability, but owned by backend tooling, not the frontend |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.3.5 [VERIFIED: npm registry] | Full-stack React framework (App Router, Route Handlers, SSR/SSG) | Already locked by UI-SPEC; latest major (16.0.0 shipped 2025-10-22, now 11 months / several patch releases mature) [CITED: nextjs.org/blog/next-16] |
| `react` / `react-dom` | 19.3.0 [VERIFIED: npm registry] | UI runtime | Required peer for Next.js 16 App Router (min React 19.2) [CITED: nextjs.org/docs/app/guides/upgrading/version-16] |
| `typescript` | 7.0.2 [VERIFIED: npm registry] | Type system | Project-mandated language per PROJECT.md |
| `prisma` (CLI) + `@prisma/client` | CLI 7.10.0, client 7.10.0 [VERIFIED: npm registry] | ORM, migrations, seed runner, Prisma Studio | See "ORM choice" rationale below |
| `postgis/postgis` (Docker image, not npm) | tag `16-3.5` (Postgres 16 + PostGIS 3.5) [CITED: hub.docker.com/r/postgis/postgis] | Local dev database with PostGIS extension pre-installed | Official image maintained by the PostGIS project; avoids manually compiling the extension |
| `zod` | 4.6.4 [VERIFIED: npm registry] | Runtime validation of jsonb attributes, hours, seed data | Standard TS-first validator; pairs with static category config for compile-time + runtime safety |
| `leaflet` + `react-leaflet` | 1.9.4 / 5.0.0 [VERIFIED: npm registry] | Interactive map with the business's pin | Free, no API key, lighter payload than Google Maps JS SDK — see Map Rendering section |
| `luxon` | 3.7.2 [VERIFIED: npm registry] | Timezone-aware "open now" computation (Asia/Colombo) | Explicit IANA-timezone handling avoids the classic UTC/local-time open-now bug (see Pitfalls) |
| `tsx` | 4.23.13 [VERIFIED: npm registry] | Run the TypeScript seed script via `prisma db seed` | Standard modern replacement for `ts-node` in Prisma's own seeding docs [CITED: prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tailwindcss` + `@tailwindcss/postcss` | 4.3.3 [VERIFIED: npm registry] | Styling | Already locked by UI-SPEC preset; v4 uses CSS-first config (`@theme` in globals.css), not `tailwind.config.js` — see State of the Art |
| `shadcn` (CLI) | 4.21.0 [VERIFIED: npm registry] | Component scaffolding (`card`, `badge`, `tabs`, `accordion`, etc. per UI-SPEC) | Run once during Wave 0 setup; the package is `shadcn`, not the deprecated `shadcn-ui` (frozen at 0.9.5) |
| `@types/leaflet` | 1.9.22 [VERIFIED: npm registry] | TS types for Leaflet (Leaflet itself ships untyped) | Required alongside `leaflet` for TypeScript builds |
| Vitest + `@testing-library/react` | 5.0.0 / 16.3.3 [VERIFIED: npm registry] | Unit/component tests | See Validation Architecture — no test framework exists yet, Wave 0 gap |
| `@playwright/test` | 1.63.0 [VERIFIED: npm registry] | E2E smoke test (directory → business page → "Open now" badge renders) | One smoke path is enough for this phase; full suite grows in later phases |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma | Drizzle ORM | Drizzle has a native `geometry('point')` column type [CITED: orm.drizzle.team/docs/guides/postgis-geometry-point] and lighter runtime, but its PostGIS `geography` type support landed via a community PR only recently and is less battle-tested; Prisma's `Unsupported()` + raw-SQL escape hatch is a documented, stable pattern, and Prisma Studio gives a solo dev a free GUI to eyeball the ~100-300 seeded rows without writing a query — worth more than Drizzle's lighter footprint at this data volume |
| Prisma + raw-SQL geography sync | Prisma with `Unsupported("geography(Point,4326)")` as the *only* geo column | Rejected for Phase 1: makes every read/write of lat/lng go through raw `$queryRaw`/`$executeRaw`, adding friction to the most-used field on the whole page, for a spatial-query capability (nearest/radius) this phase doesn't need yet (that's Phase 2 SRCH-03) |
| Leaflet + OpenStreetMap | Mapbox GL JS | Mapbox has a generous free tier and nicer default styling, but requires an API key/account and usage-based billing risk once traffic grows — Leaflet+OSM has zero billing surface, which better matches "bootstrap budget" than "free tier today, bill risk tomorrow" |
| Leaflet + OpenStreetMap | Static map image (e.g. a pre-rendered PNG via a static-maps API) | Considered for max low-bandwidth savings, but nearly every static-map provider (Google Static Maps, Mapbox Static Images) is either paid or still requires an API key; Leaflet's own tile requests are already small (dozens of KB per view) and lazy — not worth the DX loss of a non-interactive pin |
| Hours as 2 relational tables | Hours as jsonb (consistent with the attributes column) | Rejected: hours require querying/sorting by day-of-week and time ranges for the "Open now" computation; a typed relational table is both easier to query correctly and easier to validate (CHECK constraints) than a nested jsonb shape for something this structured |
| Static TS config for category attributes | `category_attributes` DB table | Rejected for Phase 1: no admin UI exists to edit it at runtime, so a DB table buys no operational benefit yet, while costing an extra query and duplicated type definitions (the render layer needs the same shape at compile time regardless of where it's stored) |

**Installation:**
```bash
npx create-next-app@16.3.5 . --typescript --tailwind --app --src-dir --import-alias "@/*"
npx shadcn@4.21.0 init
npm install @prisma/client@7.10.0 zod@4.6.4 leaflet@1.9.4 react-leaflet@5.0.0 luxon@3.7.2
npm install -D prisma@7.10.0 tsx@4.23.13 @types/leaflet@1.9.22 vitest@5.0.0 @testing-library/react@16.3.3 @playwright/test@1.63.0
npx prisma init
```

**Version verification:** All versions above were confirmed via `npm view <pkg> version` against the live npm registry on 2026-09-13 (see Package Legitimacy Audit for full signal detail). Docker image tag confirmed via web search of the official `postgis/postgis` Docker Hub page, not `npm view` (it's not an npm package).

## Package Legitimacy Audit

| Package | Registry | Age (pkg / latest ver) | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|------------------------|-----------|--------------|---------|-------------|
| `next` | npm | ~10 yrs / 2 days | 43.4M/wk | github.com/vercel/next.js | SUS ("too-new") | Approved — flag is a versioning-recency artifact (latest patch published 2 days ago), not a legitimacy signal; official Vercel repo, 43M weekly downloads |
| `react` / `react-dom` | npm | ~13 yrs / 4 days | 128M/wk, 121M/wk | github.com/react/react | SUS ("too-new") | Approved — same recency artifact; canonical React packages |
| `typescript` | npm | mature | 203M/wk | github.com/microsoft/TypeScript | OK | Approved |
| `prisma` / `@prisma/client` | npm | ~10 yrs / 1 day, 19 days | 12.6M/wk, 12.2M/wk | github.com/prisma/prisma | SUS ("too-new") | Approved — recency artifact; official Prisma org repo |
| `zod` | npm | ~6 yrs / <1 day | 209M/wk | github.com/colinhacks/zod | SUS ("too-new") | Approved — recency artifact; canonical validator, 209M weekly downloads |
| `leaflet` | npm | ~16 yrs, ver. from 2023 | 5.3M/wk | github.com/Leaflet/Leaflet | OK | Approved |
| `react-leaflet` | npm | ~11 yrs, ver. from 2024 | 2.7M/wk | github.com/PaulLeCam/react-leaflet | OK | Approved |
| `tsx` | npm | ~6 yrs / 14 days | 64.5M/wk | github.com/privatenumber/tsx | SUS ("too-new") | Approved — recency artifact; Prisma's own docs recommend it for seeding |
| `luxon` | npm | ~9 yrs, ver. from 2025-09 | 28.1M/wk | github.com/moment/luxon | OK | Approved |
| `tailwindcss` / `@tailwindcss/postcss` | npm | ~9 yrs, ver. from 2026-07 | 92.7M/wk, 27.9M/wk | github.com/tailwindlabs/tailwindcss | OK | Approved |
| `shadcn` | npm | current CLI | high (unofficial-registry install tool, not download-ranked like the above) | github.com/shadcn-ui/ui | OK | Approved — `shadcn-ui` (old name) is deprecated at 0.9.5, do not install that name |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `next`, `react`, `react-dom`, `prisma`, `@prisma/client`, `zod`, `tsx` — all flagged solely because their *most recent published version* is within the legitimacy-checker's "too-new" window, not because of any structural risk signal (no missing repo, no anomalous download count, no missing history). Each has an official GitHub org repo and tens-to-hundreds of millions of weekly downloads. No `checkpoint:human-verify` is warranted for these; the planner may install them directly. `postinstall` scripts checked for `prisma`, `next`, `tsx` — none present.

No packages in this phase were discovered via WebSearch/training data without registry cross-check — every package above was verified directly against the live npm registry with `npm view`.

## Architecture Patterns

### System Architecture Diagram

```
Browser (mobile-first, 3G/4G)
   |
   |  1. GET /directory  (SSR)              4. GET /business/[slug]  (SSR)
   v                                             v
+-----------------------------------------------------------------+
|                     Next.js 16 App Router                       |
|  Server Components: fetch via Prisma directly (no REST hop)     |
|  Route Handlers: only for client-triggered mutations/actions    |
|    (none in Phase 1 — no writes from the browser yet)           |
|                                                                   |
|  Server-side "open now" computation (Luxon, Asia/Colombo tz)    |
|  reads business_hours + business_hours_overrides at render time |
+-----------------------------------------------------------------+
   |                                     |
   |  Prisma Client                      |  photo URLs (rendered as
   v                                     |  next/image, lazy below fold)
+-----------------------------+          v
|  Postgres 16 + PostGIS ext  |   +----------------------+
|  businesses                |   | Object storage / CDN  |
|  business_hours            |   | (photo binaries —     |
|  business_hours_overrides  |   |  see Photo storage     |
|  categories (seeded)       |   |  note below)           |
|  (jsonb: businesses.attrs) |   +----------------------+
+-----------------------------+
   ^
   |  one-off: prisma/seed.ts reads
   |  seed-data/businesses.json,
   |  validates with Zod, upserts
   +-- Manually curated JSON (LIST-06)

Client-side only (dynamic-imported, ssr:false):
  Leaflet map component <--- tiles ---> OpenStreetMap tile CDN (external, free)
```

Trace the primary use case: a user requests `/business/[slug]` -> the Server Component
queries Postgres via Prisma for the business row (name, categories, jsonb attributes,
address fields, lat/lng floats) plus its `business_hours`/`business_hours_overrides` rows
-> the server computes `openNow` with Luxon before sending HTML -> the page streams to the
browser with a skeleton where the Leaflet map will mount -> a client component hydrates
and renders the Leaflet map using the same lat/lng floats, fetching OSM tiles directly
from the browser (never proxied through the Next.js server).

### Recommended Project Structure

```
src/
├── app/
│   ├── directory/
│   │   └── page.tsx            # Directory index (Server Component, paginated)
│   ├── business/
│   │   └── [slug]/
│   │       └── page.tsx        # Business profile page (Server Component)
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn-generated primitives (card, badge, tabs, ...)
│   ├── business/
│   │   ├── hours-accordion.tsx
│   │   ├── attribute-badges.tsx
│   │   ├── photo-gallery.tsx
│   │   └── business-map.tsx    # "use client", dynamic-imported, wraps react-leaflet
│   └── directory/
│       └── business-card.tsx
├── lib/
│   ├── prisma.ts               # Prisma Client singleton (avoid connection-storm in dev)
│   ├── hours/
│   │   ├── compute-open-now.ts # Luxon-based open-now algorithm (see Code Examples)
│   │   └── hours.schema.ts     # Zod schemas for hours rows
│   ├── categories/
│   │   └── category-config.ts  # Static per-category attribute config (LIST-03, LIST-05)
│   └── validation/
│       └── business.schema.ts  # Zod schema used by both seed script and (later) forms
prisma/
├── schema.prisma
├── seed.ts                     # tsx-run seed script (LIST-06)
└── seed-data/
    └── businesses.json         # Hand-curated Colombo dataset
```

### Pattern 1: Dual-column geo storage (float columns + synced PostGIS geography)

**What:** Store `latitude`/`longitude` as plain `Float` columns that Prisma reads/writes
natively, and separately maintain a `location geography(Point, 4326)` column via a
Postgres trigger, declared in Prisma with `Unsupported()` so Prisma Migrate creates the
column but the application never touches it directly.

**When to use:** Whenever a phase needs simple lat/lng display today (map pin, directions
link) but a later phase (here, Phase 2 SRCH-03 distance filter / SRCH-05 geo-decay
ranking) will need real spatial queries. Doing this now avoids a data-migration task in
Phase 2.

**Example:**
```prisma
// prisma/schema.prisma
model Business {
  id        String   @id @default(cuid())
  slug      String   @unique
  latitude  Float
  longitude Float
  // Populated by a DB trigger from latitude/longitude — never written by Prisma Client.
  location  Unsupported("geography(Point,4326)")?
  // ...other fields
}
```
```sql
-- prisma/migrations/xxxx_add_location_geography/migration.sql
ALTER TABLE "Business" ADD COLUMN "location" geography(Point, 4326);
CREATE INDEX "Business_location_gist" ON "Business" USING GIST ("location");

CREATE OR REPLACE FUNCTION sync_business_location() RETURNS trigger AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_location_sync
BEFORE INSERT OR UPDATE OF latitude, longitude ON "Business"
FOR EACH ROW EXECUTE FUNCTION sync_business_location();
```
[CITED: prisma.io/docs/orm/v7/more/comparisons/prisma-and-drizzle — Unsupported type pattern; postgis.net/documentation/faq/geometry-or-geography — geography for real-world lat/lng distances]

### Pattern 2: Structured hours as two relational tables, not jsonb

**What:** `business_hours` holds recurring weekly rows (one row per shift per day, so a
split shift is 2 rows for the same `day_of_week`); `business_hours_overrides` holds
date-specific holiday exceptions.

**When to use:** Always, for LIST-02 — the "Open now" computation needs to query "give me
today's rows" and "is there an override for today's date", which is natural relational
SQL and awkward to do correctly against a jsonb blob without re-implementing SQL's
querying inside application code.

**Example:** see Code Examples section below for full schema + open-now algorithm.

### Pattern 3: Static per-category attribute config validated with Zod, stored as jsonb

**What:** A single TypeScript file exports, per category slug, a Zod schema describing
that category's valid attribute keys/types (e.g. `restaurant` -> `delivery: boolean`,
`priceTier: 1|2|3|4`). The `businesses.attributes` column is `jsonb`. On seed/write, the
raw jsonb-shaped object is validated against the schema for that business's primary
category before insert.

**Example:**
```typescript
// lib/categories/category-config.ts
import { z } from "zod";

export const restaurantAttributesSchema = z.object({
  delivery: z.boolean().default(false),
  takeout: z.boolean().default(false),
  dineIn: z.boolean().default(true),
  outdoorSeating: z.boolean().default(false),
  goodForGroups: z.boolean().default(false),
  goodForKids: z.boolean().default(false),
  alcoholServed: z.boolean().default(false),
  reservationsAccepted: z.boolean().default(false),
  priceTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  parking: z.enum(["none", "street", "lot", "valet"]).optional(),
  wifi: z.boolean().default(false),
});

export const homeServicesAttributesSchema = z.object({
  licenseVerified: z.boolean().default(false),
  freeEstimates: z.boolean().default(false),
  emergencyService: z.boolean().default(false),
  yearsInBusiness: z.number().int().nonnegative().optional(),
  serviceAreaRadiusKm: z.number().positive().optional(),
});

export const beautySpaAttributesSchema = z.object({
  walkInsWelcome: z.boolean().default(false),
  appointmentRequired: z.boolean().default(true),
  genderSpecificServices: z.enum(["none", "women", "men", "both"]).default("none"),
  priceTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

// Keyed by category slug (from the static taxonomy config, LIST-05)
export const attributeSchemaByCategory: Record<string, z.ZodTypeAny> = {
  restaurant: restaurantAttributesSchema,
  "home-services": homeServicesAttributesSchema,
  "beauty-spa": beautySpaAttributesSchema,
  // ...remaining Appendix A categories, including the SL-specific ones
  // (tuk-repair, tutoring, wedding-vendors, tailoring) each get their own schema
};
```
[CITED: zod.dev/api — object/enum/union schema composition]

### Anti-Patterns to Avoid

- **Computing "open now" purely on the client with `new Date()`:** the visitor's device
  clock/timezone is not authoritative and 3G/4G users may load a stale page; compute on
  the server with an explicit `Asia/Colombo` zone via Luxon, and only use the client for
  a lightweight re-check (e.g. re-render every few minutes) — never as the source of
  truth for the badge shown on first paint.
- **Storing hours as a single jsonb blob of `{ mon: "9-5", tue: "9-5", ... }` strings:**
  cannot express split shifts or holiday overrides without ad hoc string parsing; use the
  relational tables in Pattern 2 instead.
- **A `category_attributes` database table with no admin UI to edit it:** adds a query and
  a sync-drift risk (DB config vs. code that renders it) for zero operational benefit in
  a phase with no admin surface — use the static TS config (Pattern 3).
- **Fetching data client-side with `useEffect`/SWR on the directory index or business
  page:** both are SEO-relevant surfaces per UI-SPEC; use Server Components so content is
  in the initial HTML.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timezone-aware date/time math for "open now" | Custom UTC-offset arithmetic | `luxon` with explicit `Asia/Colombo` zone | DST doesn't apply to Sri Lanka, but manual Date-object math still gets overnight-crossing wrong; Luxon's `Interval`/`DateTime` API handles day-boundary math correctly |
| Responsive, lazy-loaded, blur-placeholder images | Custom `<img>` + `IntersectionObserver` | `next/image` | UI-SPEC already requires srcset/sizes + blur placeholder + lazy-load below the fold — `next/image` does all of this out of the box |
| jsonb schema validation per category | Hand-rolled `if/else` type checks | `zod` schemas (Pattern 3) | Gives both compile-time TS types (`z.infer`) and runtime validation from one definition; hand-rolled checks drift from TS types over time |
| Interactive map with pan/zoom | A custom Canvas/SVG map renderer | `leaflet` + `react-leaflet` | Mature, free, handles tile loading/caching/gesture support that would take weeks to reproduce correctly |
| Idempotent seeding (safe to re-run) | A one-shot `INSERT` script that fails on re-run | Prisma `upsert` keyed on a stable `slug` | LIST-06's dataset will be edited/expanded iteratively during Phase 1 — re-running the seed script must not error or duplicate rows |

**Key insight:** Every "don't hand-roll" item above is a place where a plausible bespoke
solution looks like less work up front but silently mishandles an edge case (midnight
rollover, a slow 3G image, a malformed jsonb attribute, a re-run seed script) that this
product's target users (3G/4G Sri Lankan consumers) or this phase's own workflow (manually
curating and iterating on 100-300 seed rows) will hit immediately, not eventually.

## Common Pitfalls

### Pitfall 1: Overnight hours + holiday overrides interacting incorrectly

**What goes wrong:** A bar's hours are "Mon 18:00–02:00" (crossing midnight into
Tuesday). A naive `is_open = current_time BETWEEN open_time AND close_time` check breaks
the moment `close_time < open_time`, and a holiday-override lookup keyed on "today's date"
can look up the wrong date for the segment of the shift that occurs after midnight
(technically "tomorrow" for that closing portion).

**Why it happens:** Storing only a single `day_of_week` + `open_time`/`close_time` pair
per row, with no explicit flag for "this row's close_time belongs to the next calendar
day," makes the open-now query ambiguous exactly at the hours most likely to matter (late
night, when someone is actually checking if a place is open).

**How to avoid:** Add an explicit `crosses_midnight boolean` (or store `close_time` as
"minutes since open_time's midnight," which can exceed 24:00) on each `business_hours`
row. When computing "open now," check hours for **both** today and yesterday
(yesterday's row, if `crosses_midnight`, may still be open into today). See the Code
Examples section for a concrete algorithm. Apply the same yesterday/today double-check to
holiday overrides — if yesterday was a holiday with special hours that cross into today,
today's default hours must not silently take over at midnight.

**Warning signs:** QA test the "is a bar open now" case at exactly 00:30 local time and at
a date immediately following a seeded holiday override — both are easy to skip when
manually testing during business hours.

### Pitfall 2: Tailwind v4's config model differs from what training data assumes

**What goes wrong:** Generated code or copy-pasted snippets assume a `tailwind.config.js`
with a `theme.extend` object (the Tailwind v3 pattern). Tailwind v4 (locked by UI-SPEC,
confirmed current at 4.3.3) uses a CSS-first config: `@import "tailwindcss";` plus an
`@theme { ... }` block directly in the global CSS file, and often needs no JS config file
at all.

**Why it happens:** V3's `tailwind.config.js` pattern is extremely well-represented in
training data; v4's CSS-first approach is comparatively newer.

**How to avoid:** When shadcn's `init` runs against this Next.js 16 + Tailwind 4 project,
let it generate the CSS-first config it expects for this preset rather than hand-writing a
`tailwind.config.js`; verify custom theme tokens (from UI-SPEC's spacing/color/typography
tables) land in the `@theme` block in `globals.css`, not a JS config object.

### Pitfall 3: PostGIS `geometry` vs `geography` unit confusion

**What goes wrong:** If a future phase (or a copy-pasted snippet) uses a plain
`geometry(Point, 4326)` column with `ST_DWithin` for a proximity query, the distance
argument is interpreted in **degrees**, not meters — a "within 1km" query can silently
return results 100km away.

**Why it happens:** `geometry` and `geography` share almost identical PostGIS syntax, so
the type mismatch produces no error, just wrong results, at the exact moment a distance
filter feature (Phase 2 SRCH-03) is being tested.

**How to avoid:** Phase 1's synced `location` column is declared `geography`, not
`geometry`, specifically to avoid this trap being inherited by Phase 2's search work —
keep it that way; do not "simplify" it to `geometry` later without also converting every
distance query's units.

### Pitfall 4: Prisma seed script failing non-idempotently mid-run

**What goes wrong:** A seed script using `create()` (not `upsert()`) partially inserts 60
of 200 businesses, then fails on a duplicate-key error on re-run, or leaves the DB in a
half-seeded state that's hard to diagnose.

**Why it happens:** `create()` is the natural first choice when writing a seed script, and
works fine the first time; the failure only appears on the second run, which for a
100-300-row hand-curated dataset that gets edited iteratively is nearly guaranteed to
happen during Phase 1 development.

**How to avoid:** Use `prisma.business.upsert({ where: { slug }, update: {...}, create:
{...} })` keyed on a slug computed deterministically from the business name (with a
disambiguating suffix for collisions), and wrap the whole seed run in a transaction so a
failure partway through doesn't leave a half-seeded directory that later categories'
coverage checks can't see.

## Code Examples

### Hours schema (Prisma) supporting split shifts and overnight rollover

```prisma
// Source: pattern synthesized from PostGIS/scheduling research; no single official doc
// covers this exact shape — see Pitfall 1 for the reasoning.
model BusinessHours {
  id             String  @id @default(cuid())
  businessId     String
  business       Business @relation(fields: [businessId], references: [id])
  dayOfWeek      Int      // 0 = Sunday .. 6 = Saturday
  openTime       String   // "HH:mm", local Asia/Colombo wall-clock time
  closeTime      String   // "HH:mm"; may represent a time after midnight
  crossesMidnight Boolean @default(false) // true if closeTime is on dayOfWeek+1

  @@index([businessId, dayOfWeek])
}

model BusinessHoursOverride {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id])
  date       DateTime @db.Date // specific calendar date (holiday)
  isClosed   Boolean  @default(true)
  openTime   String?  // only set if isClosed = false but hours differ from normal
  closeTime  String?
  crossesMidnight Boolean @default(false)

  @@unique([businessId, date])
}
```

### "Open now" computation (server-side, Luxon)

```typescript
// lib/hours/compute-open-now.ts
import { DateTime } from "luxon";

const ZONE = "Asia/Colombo";

interface HoursRow {
  dayOfWeek: number;
  openTime: string; // "HH:mm"
  closeTime: string;
  crossesMidnight: boolean;
}
interface OverrideRow {
  date: string; // "yyyy-MM-dd"
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  crossesMidnight: boolean;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Checks whether `now` falls inside a shift that started on `shiftDate`.
function isWithinShift(
  now: DateTime,
  shiftDate: DateTime,
  openTime: string,
  closeTime: string,
  crossesMidnight: boolean
): boolean {
  const startOfShift = shiftDate.startOf("day").plus({ minutes: toMinutes(openTime) });
  const rawEndMinutes = toMinutes(closeTime) + (crossesMidnight ? 24 * 60 : 0);
  const endOfShift = shiftDate.startOf("day").plus({ minutes: rawEndMinutes });
  return now >= startOfShift && now < endOfShift;
}

export function computeOpenNow(
  hours: HoursRow[],
  overrides: OverrideRow[],
  nowInput?: DateTime
): boolean {
  const now = (nowInput ?? DateTime.now()).setZone(ZONE);
  const today = now.startOf("day");
  const yesterday = today.minus({ days: 1 });

  // Pitfall 1: check BOTH today's and yesterday's shifts/overrides, since an
  // overnight shift that started yesterday can still be "open" after midnight.
  for (const shiftDate of [yesterday, today]) {
    const iso = shiftDate.toISODate()!;
    const override = overrides.find((o) => o.date === iso);

    if (override) {
      if (override.isClosed) continue; // explicit holiday closure, skip this date
      if (override.openTime && override.closeTime) {
        if (isWithinShift(now, shiftDate, override.openTime, override.closeTime, override.crossesMidnight)) {
          return true;
        }
      }
      continue; // override present -> do not fall through to regular weekly hours
    }

    const dayHours = hours.filter((h) => h.dayOfWeek === shiftDate.weekday % 7);
    for (const h of dayHours) {
      if (isWithinShift(now, shiftDate, h.openTime, h.closeTime, h.crossesMidnight)) {
        return true;
      }
    }
  }
  return false;
}
```

### Seed script skeleton (idempotent, validated)

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import businessesData from "./seed-data/businesses.json";
import { attributeSchemaByCategory } from "../src/lib/categories/category-config";

const prisma = new PrismaClient();

const seedBusinessSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  primaryCategories: z.array(z.string()).min(1).max(3),
  secondaryCategories: z.array(z.string()).default([]),
  description: z.string().min(1),
  district: z.string().min(1),
  addressFreeText: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  attributes: z.record(z.unknown()).default({}),
});

async function main() {
  for (const raw of businessesData as unknown[]) {
    const business = seedBusinessSchema.parse(raw); // throws with a clear path on bad data

    const schema = attributeSchemaByCategory[business.primaryCategories[0]];
    if (schema) schema.parse(business.attributes); // fail fast on malformed jsonb attrs

    await prisma.business.upsert({
      where: { slug: business.slug },
      update: { ...business },
      create: { ...business },
    });
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
```json
// package.json (excerpt)
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```
[CITED: prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Tailwind `tailwind.config.js` with `theme.extend` | CSS-first `@theme` block in global CSS | Tailwind v4 (2025) | Any generated Tailwind config code must target the v4 CSS-first shape, not a JS config object |
| Prisma spatial data unsupported entirely | Prisma `Unsupported()` type + raw SQL escape hatch (still no native geo API) | Ongoing since ~v3, still current in v7 | Confirms the dual-column pattern (Pattern 1) is still the right workaround, not a stopgap that a newer Prisma version has since obsoleted |
| Drizzle with no PostGIS support | Drizzle native `geometry('point')` column type; `geography` type merged via community PR | 2024-2025 | Drizzle is now a closer competitor on geo support than it was a year ago, but still less mature than Prisma's raw-SQL path for this use case — noted for future re-evaluation, not actioned this phase |
| `shadcn-ui` npm package | `shadcn` npm package (renamed) | ~2024 | Install `shadcn`, not `shadcn-ui` — the latter is frozen at 0.9.5 |
| Google Maps flat $200/mo free credit | Per-API free caps only (flat credit abolished) | March 2025 [CITED: cost-saver.co.uk/blog/leaflet-vs-google-maps-mapping-tool-local-service-providers] | Reinforces the Leaflet/OSM recommendation — Google Maps pricing has gotten less bootstrap-friendly, not more |

**Deprecated/outdated:**
- `shadcn-ui` (old package name): superseded by `shadcn`.
- Next.js Pages Router: not used — UI-SPEC already commits to App Router, and Next.js 16 treats App Router as the only supported model going forward.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Neon's and Supabase's free tiers both currently support enabling the PostGIS extension without a paid plan | Environment Availability / Standard Stack | If either has since gated PostGIS behind a paid tier, the planner needs to pick self-hosted Postgres (e.g. a free-tier VM or Docker on a low-cost host) instead — verify at deploy-decision time, not required for local dev which uses the `postgis/postgis` Docker image regardless |
| A2 | Prisma's `Unsupported()` + raw-SQL-trigger pattern for PostGIS is still the recommended workaround in the current Prisma 7.x release (no native geo support has since shipped) | Architecture Patterns (Pattern 1), State of the Art | If Prisma 7/8 has shipped native geography support since training data, the trigger-based sync could be simplified or removed — low risk either way since the fallback still works |
| A3 | The exact Sri Lanka Appendix A category taxonomy slugs (e.g. `restaurant`, `home-services`, `tuk-repair`) match what PROJECT.md's Appendix A actually enumerates in full | Code Examples (Pattern 3), Standard Stack | PROJECT.md only summarizes Appendix A's top-level groups plus 4 SL-specific examples in the excerpt available to this research; the planner must pull the full leaf-category list from the original spec content folded into PROJECT.md before finalizing `category-config.ts` |

**If this table is empty:** N/A — see entries above; none block planning, all are cheap to confirm during Wave 0.

## Open Questions (RESOLVED)

1. **Photo storage backend (object storage provider) for the photo gallery / menu photos**
   - What we know: UI-SPEC requires lazy-loaded, responsive, blur-placeholder images via
     `next/image`; PROJECT.md's bootstrap-budget constraint rules out an expensive CDN.
   - What's unclear: This research did not investigate a specific free/cheap object
     storage provider (e.g. Cloudflare R2 free tier, Vercel Blob, S3-compatible
     alternatives) because CONTEXT.md's discretion list didn't name storage explicitly and
     the phase's own success criteria center on data modeling, not infra selection for
     binary assets.
   - **RESOLVED:** The planner chose deterministic `picsum.photos/seed/{slug}-{n}/800/600`
     placeholder URLs for seed data (01-03 Task 3) — no object storage provider is
     provisioned in Phase 1. Gallery/menu-tab *functionality* is fully real; only the image
     bytes are stock placeholders. Real object storage (for user-uploaded photos) is
     deferred to Phase 5 (PHOTO-01/02), which is when photos-by-users actually exist.

2. **Exact deploy target for Postgres (Neon vs Supabase vs self-hosted) beyond local dev**
   - What we know: Both Neon and Supabase free tiers support PostGIS; Neon wakes faster
     from suspension (few hundred ms vs Supabase's 1-2s), Supabase bundles more platform
     features (auth, storage) that Phase 1 doesn't need yet but Phase 2 (accounts) will.
   - What's unclear: Whether it's worth picking Supabase now to avoid a future migration
     when Phase 2 needs auth, versus picking Neon now for its simplicity and migrating
     later if needed.
   - **RESOLVED:** Phase 1 runs local Postgres only, via the `postgis/postgis` Docker
     Compose image referenced throughout this research — no plan task in this phase
     provisions a hosted deploy target. The Neon-vs-Supabase choice is deferred to Phase 2
     planning, when a real (non-local) environment first becomes necessary.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16, Prisma 7 | ✓ | v24.8.0 (local) | — (satisfies Next's `>=20.9.0` and Prisma's `>=22.18.0` minimums) |
| npm | package management | ✓ | 11.6.0 | — |
| Docker | Local Postgres+PostGIS via `postgis/postgis` image | Not verified in this sandbox — assume available on dev machine; standard for local Postgres dev | — | If unavailable, use a free-tier hosted Postgres (Neon/Supabase) for local dev too, accepting network latency during development |
| PostGIS extension | Geo storage (Pattern 1) | Available via `postgis/postgis` Docker image (self-hosted) or Neon/Supabase free tier (managed) | PostGIS 3.5.x paired with Postgres 16 | None needed — both self-hosted and every major free-tier managed Postgres option confirmed to support it |

**Missing dependencies with no fallback:** none identified.
**Missing dependencies with fallback:** Docker (fallback: hosted free-tier Postgres for local dev, at the cost of network latency during development).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.0 (unit/component) + Playwright `@playwright/test` 1.63.0 (e2e) — neither installed yet, greenfield repo |
| Config file | none — see Wave 0 Gaps |
| Quick run command | `npx vitest run lib/hours/compute-open-now.test.ts` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|--------------------|-------------|
| LIST-01 | Business page renders name, categories, description, address, lat/lng-based map placeholder | component | `npx vitest run components/business/business-page.test.tsx` | ❌ Wave 0 |
| LIST-02 | `computeOpenNow` correctly handles overnight shift + holiday override (Pitfall 1) | unit | `npx vitest run lib/hours/compute-open-now.test.ts` | ❌ Wave 0 |
| LIST-03 | Category attribute jsonb validated against the correct per-category Zod schema | unit | `npx vitest run lib/categories/category-config.test.ts` | ❌ Wave 0 |
| LIST-04 | Photo gallery renders empty state when no photos; restaurant shows Menu tab | component | `npx vitest run components/business/photo-gallery.test.tsx` | ❌ Wave 0 |
| LIST-05 | Category taxonomy config includes all SL-specific categories (tuk repair, tutoring, wedding vendors, tailoring) | unit | `npx vitest run lib/categories/category-config.test.ts` | ❌ Wave 0 (same file as LIST-03) |
| LIST-06 | Seed script is idempotent (re-run produces no duplicate/error) and seeds >=100 businesses | integration | `npx tsx prisma/seed.ts && npx tsx prisma/seed.ts` (run twice, assert row count stable) | ❌ Wave 0 |
| LOC-02 | Address model never accepts/exposes a ZIP field; district/DS-division required | unit | `npx vitest run lib/validation/business.schema.test.ts` | ❌ Wave 0 |
| (cross-cutting) | Directory index -> business page -> "Open now" badge visible smoke path | e2e | `npx playwright test e2e/directory-to-business.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run` (fast unit/component subset relevant to the task)
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] Install Vitest + Testing Library + Playwright, add `vitest.config.ts` and
      `playwright.config.ts`
- [ ] `lib/hours/compute-open-now.test.ts` — covers LIST-02, especially Pitfall 1's
      overnight/holiday interaction (write these test cases before implementation, given
      the domain complexity flagged in this research)
- [ ] `prisma/seed.test.ts` or an npm script that runs the seed twice and asserts row
      count parity — covers LIST-06's idempotency requirement
- [ ] `e2e/directory-to-business.spec.ts` — one smoke path covering the full phase

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | Phase 1 has no accounts/auth (deferred to Phase 2 AUTH-01/02/03) |
| V3 Session Management | No | No sessions in this phase |
| V4 Access Control | Partial | All Phase 1 data is public read-only (unclaimed seeded listings) — no access-control logic to build, but confirm no Route Handler in this phase accepts a write from an unauthenticated client |
| V5 Input Validation | Yes | Zod schemas at the seed-script boundary (Pattern 3, Code Examples) — this is the only "input" this phase has, since there is no user-facing write path yet |
| V6 Cryptography | No | No secrets/crypto surface in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| SQL injection via raw `$queryRaw`/`$executeRaw` used for the PostGIS geography sync (Pattern 1) | Tampering | Use Prisma's tagged-template `$queryRaw` / `$executeRaw` (parameterized) exclusively — never string-concatenate the trigger SQL or any future geo query built from user input; the trigger itself is static DDL run once via migration, not per-request, which further limits exposure |
| Malformed/oversized jsonb attribute payloads reaching the DB unvalidated | Tampering | Zod validation before every write to `businesses.attributes` (seed script now; any future admin/business-edit form later) — never write raw parsed JSON straight into the jsonb column |
| Server-Side Request Forgery via a user-supplied "photo URL" if photos are ever ingested by URL rather than upload | Tampering/Info Disclosure | Not applicable in Phase 1 (seed data only, curated by the developer) — flag for Phase 5 (PHOTO-01) when user uploads are introduced |

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view <pkg> version`, `npm view <pkg> engines`, `npm view <pkg>
  scripts.postinstall`) — all package versions and postinstall-script checks in Standard
  Stack and Package Legitimacy Audit
- `gsd-tools query package-legitimacy check` — verdicts in Package Legitimacy Audit

### Secondary (MEDIUM confidence — official docs surfaced via WebSearch, cross-checked)
- prisma.io/docs/orm/v7/more/comparisons/prisma-and-drizzle — `Unsupported()` type pattern
- prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding — seed script + `tsx` recommendation
- postgis.net/documentation/faq/geometry-or-geography — geography vs geometry unit semantics
- orm.drizzle.team/docs/guides/postgis-geometry-point and orm.drizzle.team/docs/extensions/pg — Drizzle's native geometry support (used for Alternatives Considered)
- zod.dev/api — schema composition reference
- nextjs.org/blog/next-16 and nextjs.org/docs/app/guides/upgrading/version-16 — Next.js 16 minimum versions and breaking changes
- hub.docker.com/r/postgis/postgis — official Docker image tags

### Tertiary (LOW confidence — WebSearch-aggregated community sources, not individually re-verified)
- bytebase.com, makerkit.dev, dev.to comparison articles on Prisma vs Drizzle general DX
- cost-saver.co.uk blog on Leaflet vs Google Maps pricing history
- General "Next.js monolith for solo founders" blog consensus (wpreset.com, dev.to) — directionally consistent across multiple independent sources, but no single authoritative source; treated as MEDIUM given cross-source agreement, not a single vendor's marketing claim

## Metadata

**Confidence breakdown:**
- Standard stack (Next.js/Prisma/Zod/Leaflet versions): HIGH — every version verified directly against the npm registry
- Architecture (monolith, dual-geo-column, static config, relational hours): MEDIUM-HIGH — grounded in official docs (Prisma, PostGIS, Drizzle) plus consistent multi-source community consensus on the monolith question, which has no single canonical "official" source
- Pitfalls (overnight hours, Tailwind v4 config shape, geometry/geography units, seed idempotency): MEDIUM-HIGH — the hours pitfall is synthesized reasoning grounded in the geography/geometry and scheduling research rather than a single named source; flagged accordingly and given explicit test coverage in Validation Architecture

**Research date:** 2026-09-13
**Valid until:** 30 days for the architectural/pattern guidance; treat the exact npm package versions as valid only at plan time — re-run `npm view` if planning is delayed more than ~1-2 weeks, since `next`/`react`/`prisma`/`zod`/`tsx` all showed very recent publish dates (see Package Legitimacy Audit) indicating an actively-shipping cadence.
