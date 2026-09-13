# Phase 2: Search, Discovery & Accounts - Research

**Researched:** 2026-09-13
**Domain:** Postgres native full-text + geo-ranked search on top of Prisma 7, phone-OTP auth without a heavy framework, httpOnly-cookie sessions, filterable/URL-driven Next.js 16 search UI
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (Search Technology):** Use Postgres native full-text search (`tsvector`/`GIN` index,
  trigram extension for fuzzy match) for Phase 2, NOT a standalone OpenSearch/Elasticsearch
  cluster. Structure the ranking query (relevance + geo-decay + rating-adjustment terms) so a
  future migration to OpenSearch is a swap of the query layer, not a data-model rewrite.
- **D-02 (Honest Neutral Rating Term):** "Recommended" sort's rating-adjustment term
  (Bayesian/Wilson-score) has no real rating data yet — implement the ranking formula's
  structure now (relevance + geo-decay + a rating term) but the rating term contributes a
  neutral/zero weight for every business until Phase 3 introduces real `avg_rating`/
  `review_count` data. Do NOT fabricate placeholder ratings.
- **D-03 (Dev-Stub OTP Transport):** Phone-OTP flow is fully implemented (generation,
  verification, session issuance) but the "send SMS" transport is a dev-mode stub (logs the
  OTP) behind a clean transport interface — no real SMS provider wired or paid for this phase.
- **D-04 (Session Mechanism):** httpOnly cookie-based session, not client-stored JWT in
  localStorage, implemented directly rather than a heavy full-featured auth framework.
- **D-05 (Guest Browsing Unrestricted):** No feature in Phase 2 actually requires login.
  Auth ships as forward infrastructure (signup/login/logout, session persistence, visible
  logged-in state) for Phase 3+, not because anything gates on it.
- **D-06 (Progressive Profile):** Phone + OTP is the only required signup field. Display
  name/avatar/bio are optional, addable later. A minimal "set your name" prompt post-signup
  is sufficient — no full profile page this phase.
- **D-07 (Localization Scaffolding Only):** `language_pref` (en|si|ta) stored on the user
  account for logged-in users and in a cookie for guests, with a header switcher. Selecting
  Sinhala/Tamil only persists the preference — no translated UI strings this phase.
- **D-08 (Filter UI Pattern):** Bottom-sheet/drawer on mobile, inline sidebar on desktop —
  standard, not up for debate.

### Claude's Discretion

- Exact Postgres full-text search configuration (`tsvector` column generation strategy —
  generated column vs trigger vs application-level maintenance), geo-decay formula specifics,
  and how filters compose into a single Prisma/SQL query.
- Exact OTP code format/length/expiry, and whether email/password is offered as a parallel
  path in Phase 2 or deferred (AUTH-01's "phone OTP primary, email optional" wording).
- Home discovery rail selection logic (what counts as "trending near you" / "new businesses"
  with no view/click telemetry yet) — likely simple heuristics (recently added, random-but-
  stable sample) rather than real trending signals.

### Deferred Ideas (OUT OF SCOPE)

- Real trending/personalization signals for home discovery rails — revisit once real traffic
  exists.
- OpenSearch/Elasticsearch migration — deferred until real query volume justifies the cost.
- Real SMS provider integration (Notify.lk/Dialog) — deferred past the dev-stub transport.
- Full i18n string translation for Sinhala/Tamil — deferred past `language_pref` scaffolding.
- Full profile page (avatar upload, bio editing) — deferred past the minimal name prompt.
</user_constraints>

## Project Constraints (from CLAUDE.md)

CLAUDE.md mirrors PROJECT.md. Directives that bind this phase's plan:

- **Bootstrap budget:** No paid SMS provider, no managed Redis/rate-limiting service, no
  hosted search cluster this phase — every new dependency below is either free/self-hosted
  (Postgres extensions already running locally) or a zero-cost npm library.
- **Tech stack:** Node.js/TypeScript, Postgres+PostGIS as source of truth (already running
  via Phase 1's `docker-compose.yml`) — this phase adds no new infrastructure, only schema
  and query-layer additions on top of the existing Postgres instance.
- **Workflow enforcement:** All file-changing work goes through a GSD entry point — not a
  research-phase concern, noted for the planner.
- **Localization/compliance (PROJECT.md):** Sri Lanka PDPA alignment (minimal data retention,
  real deletion path) applies to the new `User`/OTP tables this phase creates — see Security
  Domain below for what that means concretely (OTP rows are short-lived, not retained
  indefinitely).

## Summary

Phase 2 adds two independent capabilities on top of Phase 1's Prisma/Postgres/Next.js 16
stack: (1) ranked full-text + geo search over the existing 107-row `Business` table, and (2)
a from-scratch phone-OTP account system with httpOnly-cookie sessions. Neither requires new
infrastructure — both extend the same local Postgres 16 + PostGIS instance and the same
Next.js 16 monolith Phase 1 established.

For search, Postgres's built-in `tsvector`/`GIN` full-text index (the same "generated column
+ raw-SQL migration" pattern Phase 1 already used for the `location geography` column) is the
right tool at 107 rows, paired with `pg_trgm` as a fallback fuzzy-match pass, not a blended
per-query score. Prisma's query builder cannot express `tsvector`/PostGIS operators, so the
ranked search query is one parameterized `prisma.$queryRaw` (`Prisma.sql` tagged template)
computing text relevance (`ts_rank_cd`), geo-decay (`ST_Distance` fed through an exponential
decay curve), and a currently-neutral rating term in a single `SELECT`/`ORDER BY` — exactly
the "swap the query layer, not the data model" shape D-01 asks for, since an OpenSearch
migration later only replaces this one function's body. "Open now" cannot be expressed as a
simple SQL predicate without re-deriving Phase 1's overnight/holiday-override algorithm in
SQL (a proven pitfall source) — at 107 rows, the correct, bootstrap-appropriate move is to
run the ranked SQL query for all non-time filters, then apply the already-tested
`computeOpenNow` TypeScript function in application code as a post-filter before final
pagination, never a second implementation of that logic.

For auth, two new Prisma models (`User`, `OtpChallenge`) plus `iron-session` (a sealed
httpOnly-cookie library, not a full auth framework — fits D-04 precisely) cover the whole
flow. OTP codes are 6-digit, hashed at rest, expire in 5 minutes, and are rate-limited by an
in-memory per-phone/per-IP limiter (no Redis needed at this scale); the "send SMS" step is a
`OtpTransport` interface with a `ConsoleOtpTransport` dev implementation, so wiring Notify.lk/
Dialog later is a one-file swap, not a rewrite.

**Primary recommendation:** One raw-SQL ranked search query (`lib/search/run-search-query.ts`)
shared by both the `/search` Server Component (initial SSR load, URL-driven) and a
`GET /api/search` Route Handler (client-side live filter updates) + `tsvector`/`GIN`
generated column + `pg_trgm` fallback + application-layer `computeOpenNow` post-filter, and a
from-scratch `User`/`OtpChallenge` schema with `iron-session` cookies, a `crypto`-based
(no new dependency) OTP hash, and an in-memory rate limiter — no OpenSearch, no auth
framework, no Redis, no paid SMS provider.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SRCH-01 | Free-text "what" + geo "where" search, ranked results | Architecture Patterns (Pattern 1: tsvector+GIN), Code Examples (ranked query) |
| SRCH-02 | Business cards (photo/name/category/price/rating+count/distance/snippet/open-closed) + map with pins | Architecture Patterns (extend `business-card.tsx`), reuse `business-map.tsx` |
| SRCH-03 | Filters: category, price tier, open now, distance radius, rating threshold, category-conditional attributes | Architecture Patterns (Pattern 4: filter composition), Common Pitfalls (open-now) |
| SRCH-04 | 4 sort options: Recommended/Highest Rated/Most Reviewed/Distance | Architecture Patterns (Pattern 1), Code Examples (ORDER BY per sort) |
| SRCH-05 | "Recommended" blends relevance + geo-decay + Bayesian/Wilson rating, ad-auction-isolated | Architecture Patterns (Pattern 1, Pattern 2), Assumptions Log (weight tuning) |
| SRCH-06 | Home rails: trending near you, top rated, new businesses, category shortcuts | Architecture Patterns (Pattern 5: rail heuristics), Open Questions |
| AUTH-01 | Phone-OTP signup/login, optional email | Architecture Patterns (Pattern 3: OTP flow), Standard Stack (`iron-session`) |
| AUTH-02 | Guest browsing fully supported, no login wall | Architectural Responsibility Map, D-05 |
| AUTH-03 | Progressive profile, no full-profile requirement | Architecture Patterns (Pattern 3, profile prompt) |
| LOC-01 | `language_pref` on user + cookie for guests, header switcher, no translation yet | Architecture Patterns (Pattern 6: language pref) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Free-text + geo ranked search query | Database (Postgres: GIN/tsvector, PostGIS distance) | API/Backend (raw SQL orchestration via Prisma `$queryRaw`) | Ranking math (`ts_rank_cd`, `ST_Distance`, decay curve) is cheapest and most correct computed in SQL, close to the indexes it uses |
| Filter composition (category/price/attributes/rating threshold) | Database (SQL WHERE clauses) | API/Backend (builds the WHERE fragments from validated query params) | Same query as ranking — filters and ranking share one round trip, avoiding N+1 |
| "Open now" filter | API/Backend (reuses Phase 1's `computeOpenNow` in application code) | Database (supplies hours/overrides rows for the candidate set) | Re-deriving the overnight/holiday-override algorithm in SQL risks reintroducing Phase 1's Pitfall 1; reuse the tested TS function instead |
| Search results rendering (cards + map) | Frontend Server (Server Component for SSR) | Browser/Client (Route Handler + client fetch for live filter updates) | SEO-relevant initial load stays server-rendered; live filter interactivity needs a client-triggered fetch per UI-SPEC's mobile performance notes |
| Home discovery rails | API/Backend (heuristic queries: recent, stable-random) | Frontend Server (Server Component rendering) | No telemetry exists yet — heuristics are simple SQL, no client logic needed |
| Phone-OTP generation/verification | API/Backend (Route Handlers) | Database (`OtpChallenge` table) | OTP lifecycle (generate/hash/expire/rate-limit) is pure backend logic; no client-side OTP logic beyond the input UI |
| Session issuance/verification | API/Backend (`iron-session` sealed cookie) | Browser/Client (cookie storage only, never reads it — httpOnly) | Session data must never be readable/tamperable from client JS |
| Progressive profile prompt | Browser/Client (`dialog` component, optimistic UI) | API/Backend (Server Action to persist name) | Purely presentational + one mutation; no complex server orchestration |
| `language_pref` persistence | API/Backend (User row update) | Browser/Client (cookie for guests, read at render time) | Logged-in state lives in DB (durable across devices); guest state is inherently device-local, a cookie is correct and sufficient |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `iron-session` | 9.0.1 [VERIFIED: npm registry] | Sealed, encrypted, httpOnly-cookie session (no server-side session store) | Purpose-built for exactly D-04's ask — "httpOnly cookie session, not a full auth framework"; official Next.js App Router support (`getIronSession(await cookies(), ...)`) [CITED: github.com/vvo/iron-session] |
| `libphonenumber-js` | 1.13.13 [VERIFIED: npm registry] | Parse/validate/format Sri Lankan (+94) phone numbers before OTP send | Prevents malformed numbers from ever reaching the OTP transport; standard, framework-agnostic phone-parsing library used industry-wide |
| `react-hook-form` | 7.88.0 [VERIFIED: npm registry] | Form state for phone entry / OTP verify / name-prompt forms | Already implied by UI-SPEC's `form` shadcn component (which wraps this library); matches Phase 1's Zod-validation convention |
| `@hookform/resolvers` | 5.9.1 [VERIFIED: npm registry] | Wires `react-hook-form` to existing Zod `.strict()` schemas | Standard glue package for the react-hook-form + Zod combo already used project-wide |
| `input-otp` | 1.5.0 [VERIFIED: npm registry] | Underlying primitive for shadcn's `input-otp` component (already specified in 02-UI-SPEC.md) | Not a new choice — shadcn's `input-otp` block pulls this package in; confirming it here for the legitimacy audit |
| `zod` | (already installed, ^4.6.4) | Validates OTP request/verify payloads, filter query params, `User`/`OtpChallenge` write shapes | Existing project convention (Phase 1) — no new decision needed |
| Node.js built-in `crypto` | (bundled with Node, no npm install) | OTP code hashing (`createHmac`), random code generation (`randomInt`) | See Pitfall "Don't reach for bcrypt for OTP hashing" below — no new dependency needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@upstash/ratelimit` | 2.0.8 [VERIFIED: npm registry] | Distributed rate limiting backed by Upstash Redis | NOT installed this phase — documented here only as the Phase-3+/production upgrade path once deployed beyond a single instance (see Standard Stack Alternatives + Common Pitfalls) |
| `jose` | 6.2.12 [VERIFIED: npm registry] | Edge-compatible JWT sign/verify | NOT chosen this phase (see Alternatives Considered) — noted only in case a later phase needs Edge-middleware auth gating that `iron-session`'s Node-oriented cookie sealing doesn't cover as cleanly |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Postgres native `tsvector`/GIN + `pg_trgm` | Standalone OpenSearch/Elasticsearch cluster | Explicitly rejected by D-01 — no infra budget for a search cluster at 107 rows; Postgres FTS comfortably handles tens of thousands of rows before it becomes the bottleneck |
| `iron-session` (sealed cookie, no JWT) | `jose` (hand-rolled `SignJWT`/`jwtVerify` + manual cookie wrapper) | `jose` is more flexible (Edge-runtime compatible, needed if a future phase adds Next.js Middleware auth gating) but requires hand-building the encrypt/cookie-set/decrypt wrapper `iron-session` already ships; D-04 explicitly wants "implemented directly," which favors the smaller, purpose-built library over rolling JWT plumbing by hand |
| In-memory `Map`-based rate limiter | `@upstash/ratelimit` (hosted Redis) | Upstash requires a paid-eventually hosted account and adds a network hop for every OTP request; in-memory is zero-cost and sufficient for a single-instance bootstrap deployment with dev-mode OTP — explicitly the bootstrap-budget-correct choice for now, with the upgrade path documented |
| `crypto.createHmac` for OTP hashing | `bcrypt`/`bcryptjs` | Bcrypt is the textbook recommendation for password hashing, but a 6-digit OTP's keyspace (1,000,000 values) is small enough that bcrypt's deliberate slowness buys negligible extra protection against offline brute force — the real security boundary is short expiry + rate-limited attempts, not hash cost; HMAC avoids adding a native/WASM dependency for no real security gain at this data shape |
| One shared raw-SQL query function for both SSR and live-filter fetch | Separate query logic for the Server Component and the Route Handler | Duplicating the ranking SQL in two places risks silent drift (e.g. a filter added to one path but not the other) — a single `lib/search/run-search-query.ts` function called by both eliminates that class of bug |

**Installation:**
```bash
npm install iron-session@9.0.1 libphonenumber-js@1.13.13 react-hook-form@7.88.0 @hookform/resolvers@5.9.1
npx shadcn@4.21.0 add input label select dropdown-menu sheet checkbox slider input-otp avatar dialog form
```

**Version verification:** All versions above were confirmed via `npm view <pkg> version`
against the live npm registry on 2026-09-13. `input-otp`'s version is reported for legitimacy-
audit completeness even though it is installed indirectly via the `shadcn add input-otp` CLI
command, not a direct `npm install`.

## Package Legitimacy Audit

| Package | Registry | Age (pkg / latest ver) | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|------------------------|-----------|--------------|---------|-------------|
| `iron-session` | npm | mature / 2 weeks | 1.5M/wk | github.com/vvo/iron-session | SUS ("too-new") | Approved — recency artifact only; official maintainer repo, no missing history, healthy download count |
| `libphonenumber-js` | npm | mature / 3 days | 19.4M/wk | gitlab.com/catamphetamine/libphonenumber-js | SUS ("too-new") | Approved — recency artifact; extremely high download count, long-standing project |
| `react-hook-form` | npm | mature / 2 days | 40M/wk | github.com/react-hook-form/react-hook-form | SUS ("too-new") | Approved — recency artifact; canonical form library, already implied by shadcn's `form` block |
| `@hookform/resolvers` | npm | mature / ~1 month | 33.2M/wk | github.com/react-hook-form/resolvers | SUS ("too-new") | Approved — official companion package to react-hook-form, same maintainers |
| `input-otp` | npm | mature / ~1 month | 22.3M/wk | github.com/guilhermerodz/input-otp | SUS ("too-new") | Approved — this is the package shadcn's own `input-otp` registry block installs; high download count confirms legitimacy |
| `jose` (documented, not installed) | npm | mature / ~1 week | 97.8M/wk | github.com/panva/jose | SUS ("too-new") | Approved if a future phase adopts it — not installed this phase |
| `@upstash/ratelimit` (documented, not installed) | npm | mature | — | — | not checked (not installed this phase) | N/A — documented only as a future upgrade path |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `iron-session`, `libphonenumber-js`, `react-hook-form`,
`@hookform/resolvers`, `input-otp`, `jose` — all flagged solely on the legitimacy checker's
"too-new" recency heuristic (each has a very recently published patch/minor version), not on
any structural risk signal. Every one has an official maintainer-owned GitHub/GitLab repo, no
missing-history flags, and download counts in the millions-to-tens-of-millions per week.
`postinstall` scripts checked for all five installed packages (`iron-session`,
`libphonenumber-js`, `react-hook-form`, `@hookform/resolvers`, `input-otp`) — none present.
No `checkpoint:human-verify` is warranted; the planner may install all five directly.

No package name above was sourced purely from training-data recall without a registry
cross-check — every package was verified directly against the live npm registry with
`npm view`, matching the same methodology Phase 1's research used.

## Architecture Patterns

### System Architecture Diagram

```
Browser (mobile-first, 3G/4G)
   |
   |  1. GET /search?find_desc=&find_loc=&category=...   (SSR, initial load)
   |  2. Client filter change -> GET /api/search?...      (fetch, debounced,
   |     updates URL via router.replace, no full navigation)
   |  3. POST /api/auth/otp/send { phone }                 4. POST /api/auth/otp/verify { phone, code }
   v
+-----------------------------------------------------------------------+
|                        Next.js 16 App Router                          |
|  app/search/page.tsx (Server Component) ---+                          |
|  app/api/search/route.ts (Route Handler) --+--> lib/search/           |
|                                             |    run-search-query.ts  |
|                                             |    (single shared fn)   |
|                                                                         |
|  app/api/auth/otp/send/route.ts  --> lib/otp/generate-and-send.ts     |
|  app/api/auth/otp/verify/route.ts --> lib/otp/verify.ts               |
|      |                                          |                     |
|      v                                          v                     |
|  lib/otp/transport.ts (OtpTransport interface)  lib/session.ts        |
|  ConsoleOtpTransport (dev, logs code) ---------> (iron-session:       |
|  [future: NotifyLkTransport / DialogTransport]   getIronSession)      |
|                                                                         |
|  lib/rate-limit/in-memory-limiter.ts (per phone + per IP, Map-based)  |
+-----------------------------------------------------------------------+
   |                                     |                    |
   |  Prisma raw $queryRaw               | Prisma (User,      | httpOnly sealed
   |  (tsvector rank + PostGIS           | OtpChallenge)      | cookie <-> browser
   v  distance + rating term)            v                    v
+---------------------------------------------------------------+
|  Postgres 16 + PostGIS + pg_trgm                               |
|  businesses.searchable (generated tsvector, GIN index)         |
|  businesses.location (geography, existing GiST index)          |
|  businesses.name_trgm (GIN trigram index, fallback fuzzy pass) |
|  users, otp_challenges  (new this phase)                       |
+---------------------------------------------------------------+
   ^
   |  candidate set (post-SQL-filter, pre-open-now-filter)
   |  fetched WITH hours+hoursOverrides in one findMany({ id: { in: [...] } })
   +-- lib/hours/compute-open-now.ts (Phase 1, reused verbatim) applied
       in application code before final pagination/response
```

Trace the primary use case: a user submits the home page's search bar -> browser navigates to
`/search?find_desc=kottu&find_loc=Colombo+03&sort=recommended` -> the Server Component parses
and validates `searchParams`, geocodes/uses the provided lat/lng (from a prior geolocation
prompt or a district centroid lookup), calls `runSearchQuery()` -> that function issues one
`$queryRaw` computing `ts_rank_cd` + geo-decay + neutral rating term for every row matching
the WHERE clause (category/price/attributes/rating-threshold, `open now` deferred) -> if
`openNow` filter is requested, a second batched Prisma query fetches `hours`/`hoursOverrides`
for exactly the candidate IDs returned by the raw query, `computeOpenNow` filters them in
memory, and the final page is paginated in application code -> the Server Component renders
`BusinessCard` (extended with price/rating/distance/snippet props) + a lazy `BusinessMapDynamic`
with all candidate pins. A subsequent filter tap in the mobile sheet updates the URL and calls
`GET /api/search` with the same params, which calls the identical `runSearchQuery()` and
returns JSON for the client to re-render the results list without a full page reload.

### Recommended Project Structure

```
src/
├── app/
│   ├── search/
│   │   └── page.tsx                  # Server Component, SEO-relevant SSR entry (SRCH-01..06)
│   ├── api/
│   │   ├── search/
│   │   │   └── route.ts              # Route Handler, live client-driven filter updates
│   │   └── auth/
│   │       ├── otp/
│   │       │   ├── send/route.ts     # generates + "sends" (dev: logs) OTP
│   │       │   └── verify/route.ts   # verifies + issues session cookie
│   │       ├── logout/route.ts
│   │       └── language/route.ts     # sets language_pref (cookie for guest, User row if logged in)
│   ├── login/
│   │   └── page.tsx                  # phone entry -> OTP entry -> progressive-profile dialog
│   └── layout.tsx                    # header: login state + language switcher (reads session)
├── components/
│   ├── search/
│   │   ├── filter-sheet.tsx          # mobile bottom sheet (D-08)
│   │   ├── filter-sidebar.tsx        # desktop inline sidebar (D-08)
│   │   ├── sort-dropdown.tsx
│   │   └── search-result-card.tsx    # extends business-card.tsx with optional props
│   ├── home/
│   │   ├── discovery-rail.tsx
│   │   └── category-shortcuts.tsx
│   └── auth/
│       ├── phone-entry-form.tsx
│       ├── otp-entry-form.tsx
│       └── progressive-profile-dialog.tsx
├── lib/
│   ├── search/
│   │   ├── run-search-query.ts       # single shared ranking+filter SQL function
│   │   ├── search-params.schema.ts   # Zod schema for URL/query params
│   │   └── geo-decay.ts              # pure function: distanceKm -> decay score
│   ├── otp/
│   │   ├── transport.ts              # OtpTransport interface + ConsoleOtpTransport
│   │   ├── generate.ts               # 6-digit code + HMAC hash
│   │   └── otp.schema.ts             # Zod schemas for send/verify payloads
│   ├── rate-limit/
│   │   └── in-memory-limiter.ts
│   └── session.ts                    # iron-session config + getSession() helper
prisma/
└── schema.prisma                     # + User, OtpChallenge models; + businesses.searchable,
                                       #   businesses.name_trgm via raw migration SQL
```

### Pattern 1: Generated `tsvector` column + GIN index, following Phase 1's `Unsupported()` precedent

**What:** Add a `searchable tsvector GENERATED ALWAYS AS (...) STORED` column via raw
migration SQL (same technique Phase 1 used for the `location geography` column), declared in
`schema.prisma` as `Unsupported("tsvector")?` so Prisma Migrate tracks the column's existence
without trying to manage its generation expression.

**When to use:** For SRCH-01's free-text search. A generated column (not a trigger, not
application-level maintenance) is preferred because Postgres keeps it transactionally
consistent with `name`/`description`/category-label text automatically, and — unlike a
trigger — requires no separate function to maintain, and — unlike application-level
maintenance — can never drift out of sync with a direct SQL write (e.g. a future admin tool).

**Example:**
```prisma
// prisma/schema.prisma
model Business {
  // ...existing Phase 1 fields...
  searchable Unsupported("tsvector")?
  @@index([searchable], type: Gin, map: "business_searchable_gin_idx")
}
```
```sql
-- prisma/migrations/xxxx_add_search_columns/migration.sql
ALTER TABLE "Business" ADD COLUMN "searchable" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("name", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'B')
  ) STORED;
CREATE INDEX "business_searchable_gin_idx" ON "Business" USING GIN ("searchable");

-- Trigram fallback for typo-tolerant name matching (pg_trgm), separate from
-- the tsvector index — used only when the primary tsvector query returns
-- zero rows, not blended into the same score expression.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "business_name_trgm_idx" ON "Business" USING GIN ("name" gin_trgm_ops);
```
[CITED: postgresql.org/docs/current/textsearch-tables.html — generated tsvector column pattern;
postgresql.org/docs/current/pgtrgm.html — pg_trgm similarity/index operators]

### Pattern 2: One raw-SQL ranking query combining text relevance + geo-decay + neutral rating term

**What:** A single `prisma.$queryRaw` (via the `Prisma.sql` tagged template — never
`$queryRawUnsafe`) computes three normalized 0-1 sub-scores and combines them with tunable
weights into one `score` column used for `ORDER BY` when `sort=recommended`.

**When to use:** SRCH-01, SRCH-05. This is the one place Prisma's query builder genuinely
cannot reach (no `tsvector`/`ST_Distance` support), so a raw query is the correct, sanctioned
escape hatch — the same one Phase 1 already established for the `geography` column.

**Example:**
```typescript
// lib/search/geo-decay.ts
// Exponential decay: full score (1.0) within `offsetKm`, halving every
// `scaleKm` beyond that — same shape as Elasticsearch's `exp` decay function
// (decay=0.5), chosen so a future OpenSearch migration can reuse the exact
// same origin/scale/offset/decay parameters. [CITED: elastic.co function_score decay functions]
export function geoDecaySql(distanceColumnKm: string, offsetKm = 1, scaleKm = 5) {
  return `POWER(0.5, GREATEST(0, ${distanceColumnKm} - ${offsetKm}) / ${scaleKm}::float)`;
}
```

```typescript
// lib/search/run-search-query.ts
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { geoDecaySql } from "./geo-decay";

// D-02: the rating term is a hardcoded neutral scalar until Phase 3 adds
// real avg_rating/review_count columns — never a fabricated average.
// TODO(Phase 3): replace `0.5::float AS rating_score` below with a real
// Bayesian-shrinkage expression once review data exists.
const RATING_SCORE_NEUTRAL = "0.5::float";

// Tunable weights — kept as named constants, not scattered magic numbers,
// so the planner/product owner can retune without touching the SQL shape.
// [ASSUMED — see Assumptions Log A1]
const W_TEXT = 0.5;
const W_GEO = 0.35;
const W_RATING = 0.15;

export interface SearchFilters {
  textQuery?: string;
  originLat?: number;
  originLng?: number;
  categories?: string[];
  priceTiers?: number[];
  ratingMin?: number; // no-op until Phase 3 — see Common Pitfalls
  attributeFilters?: Record<string, unknown>;
}

export async function runSearchQuery(filters: SearchFilters) {
  const conditions: Prisma.Sql[] = [];

  if (filters.textQuery) {
    conditions.push(
      Prisma.sql`"searchable" @@ plainto_tsquery('english', ${filters.textQuery})`
    );
  }
  if (filters.categories?.length) {
    conditions.push(
      Prisma.sql`("primaryCategories" && ${filters.categories}::text[] OR "secondaryCategories" && ${filters.categories}::text[])`
    );
  }
  if (filters.priceTiers?.length) {
    conditions.push(
      Prisma.sql`("attributes"->>'priceTier')::int = ANY(${filters.priceTiers})`
    );
  }
  // Category-conditional attribute filters compose the same way — one
  // Prisma.sql fragment per active checkbox, joined with AND below.
  // Rating threshold: intentionally NOT translated into a WHERE clause yet
  // (see Common Pitfalls — no real rating data exists in Phase 2).

  const whereClause = conditions.length
    ? Prisma.join(conditions, " AND ")
    : Prisma.sql`TRUE`;

  const originPoint =
    filters.originLat != null && filters.originLng != null
      ? Prisma.sql`ST_SetSRID(ST_MakePoint(${filters.originLng}, ${filters.originLat}), 4326)::geography`
      : Prisma.sql`NULL`;

  return prisma.$queryRaw<
    Array<{ id: string; distanceKm: number | null; score: number }>
  >(Prisma.sql`
    SELECT
      "id",
      CASE WHEN ${originPoint} IS NOT NULL
        THEN ST_Distance("location", ${originPoint}) / 1000.0
        ELSE NULL END AS "distanceKm",
      (
        ${W_TEXT} * COALESCE(ts_rank_cd("searchable", plainto_tsquery('english', ${filters.textQuery ?? ""}), 32), 0)
        + ${W_GEO} * CASE WHEN ${originPoint} IS NOT NULL
            THEN (${Prisma.raw(geoDecaySql(`(ST_Distance("location", ${"originPoint"}) / 1000.0)`))})
            ELSE 0.5 END
        + ${W_RATING} * ${Prisma.raw(RATING_SCORE_NEUTRAL)}
      ) AS "score"
    FROM "Business"
    WHERE ${whereClause}
    ORDER BY "score" DESC
  `);
}
```
[CITED: prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries — `Prisma.sql` tagged
template, parameterized raw queries as the sanctioned pattern for PostGIS/tsvector operators]

**Note on the code sample above:** the `Prisma.raw(geoDecaySql(...))` call is illustrative of
the *shape* of the decay expression: in the actual implementation, build the whole `score`
expression as one interpolated `Prisma.sql` string (substituting the real distance sub-
expression directly) rather than nesting `Prisma.raw` inside a template literal as pseudocode
does above — the planner/executor should write this as a single well-tested SQL string with
unit tests asserting known distance/score pairs, not by composing raw fragments dynamically at
runtime from unvalidated input.

### Pattern 3: Phone-OTP flow — `OtpChallenge` table, HMAC-hashed codes, pluggable transport

**What:** Two new Prisma models plus a small interface for the "send" step.

**Example:**
```prisma
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  phone         String   @unique
  name          String?
  email         String?  @unique
  languagePref  String   @default("en") // "en" | "si" | "ta"
  hasSeenProfilePrompt Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model OtpChallenge {
  id          String    @id @default(cuid())
  phone       String
  codeHash    String    // HMAC-SHA256(code, OTP_HMAC_SECRET), never plaintext
  expiresAt   DateTime  // now() + 5 minutes at creation
  attemptCount Int      @default(0)
  consumedAt  DateTime?
  createdAt   DateTime  @default(now())

  @@index([phone, expiresAt])
}
```
```typescript
// lib/otp/transport.ts
export interface OtpTransport {
  send(phone: string, code: string): Promise<void>;
}

// D-03: dev-mode stub. Never used when NODE_ENV === "production" without an
// explicit real transport also being wired — guard this at the call site.
export class ConsoleOtpTransport implements OtpTransport {
  async send(phone: string, code: string): Promise<void> {
    console.log(`[dev-otp] Code for ${phone}: ${code}`);
  }
}

// Phase 2 wires ConsoleOtpTransport only. A future NotifyLkTransport or
// DialogTransport implements the same interface — no call-site changes.
```
```typescript
// lib/otp/generate.ts
import { randomInt, createHmac, timingSafeEqual } from "node:crypto";

const OTP_TTL_MS = 5 * 60 * 1000;

export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtpCode(code: string): string {
  return createHmac("sha256", process.env.OTP_HMAC_SECRET!).update(code).digest("hex");
}

export function verifyOtpCode(code: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtpCode(code));
  const stored = Buffer.from(storedHash);
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

export const OTP_EXPIRY_MS = OTP_TTL_MS;
```
[CITED: NIST SP 800-63B-4 — out-of-band OTP codes invalid after 10 minutes, 5 minutes chosen
as a tighter-than-minimum default; timingSafeEqual pattern is Node's documented
constant-time-comparison primitive]

### Pattern 4: Filter composition via conditional `Prisma.sql` fragments (no N+1)

**What:** Every active filter (category, price tier, category-conditional attribute) becomes
one `Prisma.sql` condition pushed into an array, joined with `AND` — shown inline in Pattern 2
above. Category-conditional attributes read their valid keys from the existing
`lib/categories/category-config.ts` (same source of truth as `attribute-badges.tsx`), never a
duplicated list.

**When to use:** SRCH-03. This keeps filter count arbitrary (0 to N active filters) without
generating N different query shapes — one query builder function handles all combinations.

**Anti-pattern avoided:** issuing one query per candidate business to check its attributes
(N+1) — the jsonb `attributes->>'key'` operator lets every attribute filter live in the same
`WHERE` clause as everything else, evaluated by Postgres against the whole table at once.

### Pattern 5: "Open now" as an application-layer post-filter, not a SQL predicate

**What:** The ranked SQL query (Pattern 2) runs without any open-now condition. If
`openNow=true` was requested, a second Prisma query fetches `hours` + `hoursOverrides` for
exactly the candidate IDs the raw query returned (`prisma.business.findMany({ where: { id: {
in: candidateIds } }, include: { hours: true, hoursOverrides: true } })` — one query, not N),
then `computeOpenNow` (Phase 1's tested function, imported verbatim from
`lib/hours/compute-open-now.ts`) filters the array in application code before final
pagination.

**When to use:** Always, for SRCH-03's open-now filter, at the current data volume (107
businesses). Re-deriving the overnight-shift/holiday-override algorithm as a SQL `CASE`
expression would duplicate Phase 1's most delicate piece of domain logic in a second language,
directly risking a repeat of Phase 1's Pitfall 1 (overnight hours + holiday overrides
interacting incorrectly) — a bug class expensive to get right once, let alone twice.

**Anti-pattern avoided:** don't add an `isOpenNow` boolean column recomputed by a cron job —
at 107 rows recomputing on every search request costs nothing and is always accurate to the
second; a cached column would need an invalidation strategy for zero benefit yet (revisit only
if/when listing volume reaches thousands of rows, per D-01's own "don't build infra before
volume justifies it" logic applied consistently here).

### Pattern 6: `language_pref` storage — cookie for guests, `User` column for logged-in

**What:** `User.languagePref` (`String`, default `"en"`) for logged-in users, plus a plain
(non-`httpOnly`) `lang_pref` cookie for guests, set client-side via `document.cookie` on
selection (no server round trip needed for a guest preference with zero security sensitivity).
On login, if a guest had already set a cookie preference, copy it onto the new `User` row once
at signup time so the choice isn't lost.

**When to use:** LOC-01. Reading the effective preference: server components read
`cookies().get("lang_pref")` for guests or `session.user.languagePref` for logged-in users, at
render time, to drive the header `select`'s current value — never inferred from `Accept-
Language` this phase (that's a v2 nicety, not required by LOC-01's wording).

### Anti-Patterns to Avoid

- **Blending `pg_trgm` similarity into the same `ORDER BY` as `ts_rank_cd`:** the two indexes
  answer different questions (typo tolerance vs. language-aware relevance) and combining their
  raw scores produces an unprincipled number; use trigram only as a distinct fallback pass
  when the primary tsvector query returns zero rows.
- **Computing the geo-decay/rating/text score in three separate queries then joining in
  JS:** wastes round trips and cannot be `ORDER BY`'d/`LIMIT`'d efficiently — compute the
  combined score in one SQL expression (Pattern 2).
- **Storing OTP codes in plaintext, even "temporarily":** hash immediately at generation time
  (Pattern 3) — a plaintext OTP column is a needless liability even for a 5-minute-lived row.
- **Client-stored JWT in `localStorage` for the session:** explicitly rejected by D-04 — always
  an httpOnly cookie (`iron-session`), never anything readable by page JS.
- **Duplicating the ranking SQL between the Server Component page and the Route Handler:**
  always call the single shared `runSearchQuery()` function from both (Pattern 2's structure).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Encrypted/sealed httpOnly session cookies | Custom AES-GCM cookie encode/decode + expiry logic | `iron-session` | Cookie sealing with correct IV handling, tamper detection, and size-limit errors is exactly the kind of code that looks simple and hides subtle bugs (nonce reuse, missing `httpOnly`/`secure` defaults) — `iron-session` ships this solved and Next.js-App-Router-aware |
| Constant-time secret comparison | `storedHash === candidateHash` | `crypto.timingSafeEqual` | A naive `===` string comparison leaks timing information proportional to matching prefix length — a textbook side-channel, trivially avoided with Node's built-in primitive |
| "Open now" logic, twice (SQL + TS) | A SQL `CASE` re-implementation of the overnight/holiday-override algorithm | Reuse `lib/hours/compute-open-now.ts` verbatim (Pattern 5) | Phase 1 already found and fixed the overnight-crossing/holiday-override edge cases once; re-deriving the same logic in SQL is a second chance to get it wrong with no test coverage carried over |
| Fuzzy/typo-tolerant text matching | A Levenshtein-distance loop in application code | Postgres `pg_trgm` (`similarity()`/GIN trigram index) | Postgres's C-implemented trigram matching is orders of magnitude faster than an app-level string-distance loop over every row |
| Debounced client-side filter fetching | Hand-rolled `setTimeout`/`AbortController` debounce wiring from scratch | A small, well-tested debounce hook (or a minimal 10-line utility, tested once) reused across every filter control | Not a "don't hand-roll, use a library" case (a 10-line debounce is fine to write), but *do* write it once and share it — five separately-hand-rolled debounce implementations across filter controls is the actual anti-pattern to avoid |

**Key insight:** Every item above is a place where Phase 1 already paid down real domain
complexity (hours/overnight logic) or where a well-known primitive already exists in the
stack (Node's `crypto`, Postgres's `pg_trgm`) — Phase 2's job is to reuse and compose those,
not rebuild them a second time under time pressure.

## Runtime State Inventory

> This phase is not a rename/refactor/migration phase — it is additive (new models, new
> routes, new UI). No existing runtime state (stored data, live service config, OS-registered
> state, secrets, build artifacts) is being renamed or moved. This section is omitted per the
> "omit entirely for greenfield phases" instruction; the phase adds new schema/tables but does
> not rename or migrate any existing ones from Phase 1.

## Common Pitfalls

### Pitfall 1: Rating threshold filter (SRCH-03) has literally nothing to filter on yet

**What goes wrong:** SRCH-03 requires a rating-threshold filter ("3+", "4+", "4.5+" per
UI-SPEC), but D-02 explicitly forbids fabricating rating data before Phase 3. If the filter is
wired to a nonexistent/always-null `avgRating` column with a naive `WHERE avgRating >= 3`, it
will silently return zero results for every threshold above "Any" — which looks like a bug,
not an honest limitation.

**Why it happens:** The UI-SPEC (correctly) still specifies the full filter row because SRCH-03
is a locked requirement; the underlying data just isn't there yet.

**How to avoid:** Render the rating-threshold filter chips (per UI-SPEC), but until Phase 3,
either (a) disable the "3+"/"4+"/"4.5+" chips with a tooltip/disabled state noting "Ratings
launch in a future update," or (b) make every threshold a no-op that returns the same
unfiltered set as "Any" — recommend (a), since a filter that visibly does nothing when tapped
is a worse UX than one that's honestly disabled. Document whichever the planner chooses
explicitly in the plan so it isn't discovered as a "bug" during verification.

**Warning signs:** Any verification step that taps "4+" and expects a *different, non-empty*
result set than "Any" — this is expected to be identical or empty in Phase 2, by design.

### Pitfall 2: "Highest Rated" / "Most Reviewed" sorts have no real differentiator either

**What goes wrong:** Same root cause as Pitfall 1 — with all businesses at the same neutral
rating state, `ORDER BY avgRating DESC` produces either a Postgres-default (often
insertion-order-adjacent) ordering or throws if the column doesn't exist yet, and repeated
identical-looking result pages across different sort options undermine user trust in the sort
control itself.

**How to avoid:** Give "Highest Rated" and "Most Reviewed" a deterministic, stable secondary
sort key (e.g. `ORDER BY <neutral-value> DESC, name ASC`) so results are at least consistent
and explainable across requests/pages, rather than appearing to shuffle randomly. Consider
whether the plan should note in the UI (or simply accept, since D-02 already blessed "honest
neutral" data) that these two sorts are functionally equivalent to a stable default ordering
until Phase 3.

### Pitfall 3: In-memory rate limiter resets on every dev-server restart / doesn't survive multi-instance deploys

**What goes wrong:** A `Map`-based rate limiter's state lives in the Node process memory —
restarting `next dev` (common during active development) silently resets everyone's rate-limit
counters, and if this ever deploys to more than one server instance/serverless function, each
instance has its own independent counter, meaning the *effective* rate limit is
`limit × instance count`, not `limit`.

**Why it happens:** In-memory state is the simplest possible implementation and is correct for
exactly one thing: a single long-running Node process.

**How to avoid:** Document this limitation directly in the rate-limiter module's comments (not
just this research doc) so a future deploy to a multi-instance target doesn't silently weaken
the OTP abuse protection without anyone noticing; the documented upgrade path is
`@upstash/ratelimit` (Standard Stack, Alternatives Considered) — a one-file swap since the
limiter should be built behind a small `checkRateLimit(key): Promise<boolean>` interface from
day one, mirroring the `OtpTransport` pattern.

### Pitfall 4: `ts_rank_cd`'s normalization flag changes score range — pick one and be consistent

**What goes wrong:** `ts_rank`/`ts_rank_cd` accept an optional integer "normalization" bitmask
(e.g. `32` divides by `rank+1`, keeping values in `0..1`) — omitting it produces unbounded
scores that don't compose predictably with the `0..1`-ranged geo-decay and rating terms in
Pattern 2's weighted sum.

**How to avoid:** Always pass normalization flag `32` explicitly (as shown in Pattern 2's code
example) so the text-relevance term stays in a comparable `0..1` range to the other two terms
— a raw, unnormalized `ts_rank_cd` value can exceed 1.0 and silently dominate the weighted sum
regardless of the tuned weights.

### Pitfall 5: `crossesMidnight` open-now logic already found a bug class once — don't reopen it

**What goes wrong:** (Restated from Phase 1's own Pitfall 1, directly relevant here because
Phase 2 is the first phase to *query* hours data at scale, for many businesses per search
request, rather than one business per page render.) If a plan interprets "fetch hours for the
candidate set" as "run `computeOpenNow` once per business in a loop calling the DB each time,"
that's an N+1 query bug, not a correctness bug — but it's the same instinct (per-row work) that
caused Phase 1's original issue.

**How to avoid:** Fetch all candidate businesses' `hours`/`hoursOverrides` in exactly one
`findMany({ where: { id: { in: candidateIds } } })` call (Pattern 5), then loop over the
already-fetched in-memory array calling the pure `computeOpenNow` function — zero additional
DB round trips per business.

## Code Examples

### OTP send Route Handler (rate-limited, dev-transport)

```typescript
// app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtpCode, OTP_EXPIRY_MS } from "@/lib/otp/generate";
import { ConsoleOtpTransport } from "@/lib/otp/transport";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-limiter";

const sendOtpSchema = z.object({ phone: z.string().min(1) }).strict();
const transport = new ConsoleOtpTransport(); // D-03: dev-mode stub only

export async function POST(req: NextRequest) {
  const body = sendOtpSchema.parse(await req.json());
  const parsed = parsePhoneNumberFromString(body.phone, "LK");
  if (!parsed?.isValid()) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  const phone = parsed.number; // E.164 normalized, e.g. +947XXXXXXXX

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await checkRateLimit(`otp-send:${phone}`, { max: 3, windowMs: 60_000 })
    && await checkRateLimit(`otp-send-ip:${ip}`, { max: 10, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const code = generateOtpCode();
  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });
  await transport.send(phone, code);

  return NextResponse.json({ ok: true });
}
```
[CITED: prisma.io/docs — parameterized writes via `prisma.model.create`; NIST SP 800-63B-4 —
rate-limit + expiry as the actual OTP security boundary]

### Session helper (`iron-session`)

```typescript
// lib/session.ts
import { getIronSession, type IronSessionData } from "iron-session";
import { cookies } from "next/headers";

declare module "iron-session" {
  interface IronSessionData {
    userId?: string;
    phone?: string;
  }
}

export async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!, // 32+ char secret, env-only
    cookieName: "lankareview_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  });
}
```
[CITED: github.com/vvo/iron-session — `getIronSession(await cookies(), options)` App Router
pattern, secure cookie defaults]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `next-iron-session` (Pages-Router-era package) | `iron-session` (App-Router-native, `getIronSession(await cookies(), ...)`) | iron-session v6+ (2023+), current 9.0.1 | Do not install `next-iron-session` — it targets the old Pages Router API shape and is effectively superseded |
| `jsonwebtoken` for session JWTs in Next.js | `jose` (Edge-runtime compatible) | Ongoing since Next.js Middleware/Edge became common (~2022+) | Not directly relevant this phase (iron-session chosen instead), but if a future phase needs Edge-middleware auth, `jose` is the current standard, not `jsonwebtoken` |
| Manual `ts_rank` without a normalization flag | Explicit normalization bitmask (e.g. `32`) when composing multi-term scores | Long-standing Postgres behavior, not a recent change — flagged here because it's a common oversight, not because it's new | Composed ranking formulas (Pattern 2) silently break without this |
| Next.js `searchParams`/`params` as plain objects | `searchParams`/`params` as Promises requiring `await` | Next.js 15 (2024), still current in 16 | Every Server Component reading `searchParams` in this phase must `await` it first — same pattern Phase 1 already used in `app/directory/page.tsx` |

**Deprecated/outdated:**
- `next-iron-session`: superseded by `iron-session` (post-v6, App-Router-native).
- Unnormalized `ts_rank` in a multi-term formula: not deprecated per se, but a documented
  footgun (Pitfall 4) worth flagging as "don't do this" rather than "old way of doing this."

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The specific ranking weights (`W_TEXT=0.5, W_GEO=0.35, W_RATING=0.15`) and geo-decay parameters (`offsetKm=1, scaleKm=5`) are reasonable Phase-2 defaults | Architecture Patterns (Pattern 2) | These are product-tuning values with no authoritative source — if search results "feel wrong" (e.g. too geo-dominated or too text-dominated) during manual QA, the fix is adjusting these named constants, not re-architecting the query; flag for product-owner confirmation during/after implementation, not a blocker to starting the plan |
| A2 | Disabling (not hiding) the rating-threshold filter chips above "Any" is the right Phase-2 UX choice (Pitfall 1) | Common Pitfalls (Pitfall 1) | If the planner instead wires the filter as a silent no-op, a tester could reasonably file this as a bug; the plan should make an explicit, documented choice either way rather than leaving it ambiguous |
| A3 | A 5-minute OTP expiry (tighter than NIST's 10-minute ceiling) and a 6-digit code are the right Phase-2 defaults | Standard Stack, Architecture Patterns (Pattern 3) | Low risk either way — both are within documented best-practice ranges; easy to change via the `OTP_EXPIRY_MS` constant if product wants a different window |
| A4 | HMAC-SHA256 (not bcrypt) is sufficient for OTP-code-at-rest hashing given the 6-digit keyspace and rate-limited verify endpoint | Standard Stack (Alternatives Considered), Don't Hand-Roll | If a future security review disagrees, swapping to bcrypt is a small isolated change to `lib/otp/generate.ts` only — no schema change needed since `codeHash` is already a plain string column |
| A5 | Guests should be able to set `lang_pref` via a plain non-`httpOnly` client-set cookie (Pattern 6) rather than a server round trip | Architecture Patterns (Pattern 6) | If PDPA or a future audit requires all cookie-setting to go through a logged, server-side path, this would need to move to a Route Handler/Server Action — low likelihood given the preference itself carries no PII or security sensitivity |

**If this table is empty:** N/A — see entries above. None are blocking; all are cheap to
confirm or adjust during planning/implementation.

## Open Questions

1. **"Top Rated" home rail (SRCH-06) has the exact same no-real-data problem as the
   Recommended sort's rating term (D-02), but wasn't explicitly addressed by CONTEXT.md for
   the rail context specifically.**
   - What we know: D-02 already establishes the principle (no fabricated ratings) for the
     search ranking formula; UI-SPEC's copywriting contract deliberately avoids "Top Rated
     This Month" language to not imply a time window that doesn't exist.
   - What's unclear: Whether "Top Rated" should (a) use the exact same recently-added/
     stable-random heuristic as the "Trending" and "New Businesses" rails (functionally
     making it a third arbitrary sample, just honestly so), or (b) be temporarily relabeled/
     hidden until Phase 3 has real ratings to show.
   - Recommendation: Treat it the same as (a) — a stable-random sample with a different
     deterministic seed than the other rails (so the three non-category rails don't show
     identical business sets) — consistent with D-02's "honest neutral, not fabricated" logic
     already accepted for the main ranking formula. Flag this choice for the user during
     `/gsd-plan-phase` or discuss-phase follow-up if the planner wants explicit sign-off,
     since CONTEXT.md's discretion note names rail logic generally but not this exact edge
     case.

2. **Geolocation source for "where" search (`find_loc`) — browser Geolocation API vs. a
   district/DS-division text lookup vs. both.**
   - What we know: UI-SPEC's search bar placeholder pre-fills with "a detected location label
     when available" and falls back to a placeholder if "geolocation is denied/unavailable" —
     implying the browser Geolocation API is the primary intended source.
   - What's unclear: Whether typing a district name (e.g. "Colombo 03") into the "where" field
     should also work as a fallback/alternative geocoding path (mapping a district name to a
     lat/lng centroid), given LOC-02 already establishes district/DS-division as the address
     model's source of truth.
   - Recommendation: Support both — browser Geolocation API as the default/fast path, with a
     small static `district -> centroid lat/lng` lookup table (reusing the same district
     strings already seeded in Phase 1's `Business.district` column) as the fallback when a
     user types a location instead of granting geolocation permission. This requires no new
     dependency, just a small static table the planner can generate from Phase 1's already-
     seeded district values.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Postgres `pg_trgm` extension | Fuzzy/typo-tolerant fallback search (Pattern 1) | Bundled with standard Postgres distributions (including the `postgis/postgis` Docker image Phase 1 already runs) — not verified as already `CREATE EXTENSION`'d in this project's DB, but the extension ships with Postgres itself, no separate install needed | Standard with Postgres 16 | None needed — `CREATE EXTENSION IF NOT EXISTS pg_trgm;` in the migration is sufficient |
| `OTP_HMAC_SECRET`, `SESSION_SECRET` env vars | OTP hashing (Pattern 3), session sealing (Code Examples) | Not yet present in `.env`/`.env.example` (checked — current `.env.example` only has `DATABASE_URL`-shaped content from Phase 1) | — | Must be added to `.env.example` (with clear placeholder values, never real secrets committed) and generated locally before this phase's OTP/session code can run — flag as a Wave 0 setup task |
| Docker (local Postgres) | All of the above | ✓ (per Phase 1's research/verification, already running) | — | — |

**Missing dependencies with no fallback:** none — `pg_trgm` ships with Postgres itself, and the
two new env vars are a one-time local setup step, not an external service dependency.
**Missing dependencies with fallback:** none applicable this phase.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.0 (unit/component) + Playwright `@playwright/test` 1.63.0 (e2e) — both already installed and configured by Phase 1 |
| Config file | `vitest.config.ts`, `playwright.config.ts` (existing, Phase 1) |
| Quick run command | `npx vitest run lib/search/run-search-query.test.ts lib/otp/generate.test.ts` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|--------------------|-------------|
| SRCH-01 | Free-text query returns businesses ranked by combined score; a query matching zero tsvector rows still returns nothing (no silent fallback to unfiltered) | integration | `npx vitest run lib/search/run-search-query.test.ts` | ❌ Wave 0 |
| SRCH-02 | Search result card renders price tier, rating-or-"No reviews yet", distance, snippet, open/closed badge | component | `npx vitest run components/search/search-result-card.test.tsx` | ❌ Wave 0 |
| SRCH-03 | Category/price/attribute filters compose correctly (AND semantics); open-now filter matches `computeOpenNow` exactly for a known overnight-shift fixture | unit + integration | `npx vitest run lib/search/run-search-query.test.ts` (same file, multiple describe blocks) | ❌ Wave 0 |
| SRCH-04 | All 4 sort options produce a stable, deterministic order for a fixed fixture set | unit | `npx vitest run lib/search/run-search-query.test.ts` | ❌ Wave 0 |
| SRCH-05 | Recommended score = weighted sum of the three sub-terms for known inputs (golden-value test) | unit | `npx vitest run lib/search/geo-decay.test.ts` | ❌ Wave 0 |
| SRCH-06 | Home page renders 4 rails in the specified order; a rail with zero results is hidden entirely (not shown empty) | component | `npx vitest run components/home/discovery-rail.test.tsx` | ❌ Wave 0 |
| AUTH-01 | OTP send + verify round trip issues a valid session cookie; wrong code increments `attemptCount` and eventually locks out | integration | `npx vitest run lib/otp/verify.test.ts` | ❌ Wave 0 |
| AUTH-02 | Every Phase-2 page (search, home, business page) renders fully with no session cookie present (no redirect/blocked render) | e2e | `npx playwright test e2e/guest-browsing.spec.ts` | ❌ Wave 0 |
| AUTH-03 | Progressive-profile dialog appears exactly once after first verification; "Skip for now" and "Save" both dismiss it permanently | component | `npx vitest run components/auth/progressive-profile-dialog.test.tsx` | ❌ Wave 0 |
| LOC-01 | Selecting Sinhala/Tamil persists the cookie/User field and shows the "coming soon" note; no UI strings actually change | component | `npx vitest run components/layout/language-switcher.test.tsx` | ❌ Wave 0 |
| (cross-cutting) | Full flow: home -> search -> filter -> open business -> log in via OTP -> see logged-in header state | e2e | `npx playwright test e2e/search-and-auth-flow.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run` (fast unit/component subset relevant to the task)
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `lib/search/run-search-query.test.ts` — covers SRCH-01/03/04, especially the open-now
      post-filter's interaction with pagination (write test fixtures spanning an
      overnight-crossing business, reusing Phase 1's known fixture shape)
- [ ] `lib/search/geo-decay.test.ts` — golden-value tests for the decay curve and combined
      score formula (SRCH-05)
- [ ] `lib/otp/generate.test.ts` + `lib/otp/verify.test.ts` — code generation range, hash/verify
      round trip, expiry boundary, attempt-count lockout (AUTH-01)
- [ ] `e2e/guest-browsing.spec.ts` — asserts zero auth redirects across all Phase 2 pages
      (AUTH-02, the single most important regression to catch given D-05)
- [ ] `e2e/search-and-auth-flow.spec.ts` — one smoke path covering the full phase
- [ ] `OTP_HMAC_SECRET` / `SESSION_SECRET` env vars added to `.env.example` and local `.env`
      before any OTP/session test can run against a real (non-mocked) session helper

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | Yes | Phone-OTP as the sole authentication factor (AUTH-01) — no password to weakly hash/reuse-check, but the OTP *is* the credential: 6-digit, hashed at rest (HMAC-SHA256), 5-minute expiry, rate-limited send + verify (Pattern 3) |
| V3 Session Management | Yes | `iron-session` sealed httpOnly cookie (D-04); `secure` flag enforced in production, `sameSite: lax`, 30-day rolling expiry; session invalidated by clearing the cookie server-side on logout (no server-side session table to also invalidate, by design — sealed cookies are self-contained) |
| V4 Access Control | Partial | No feature in Phase 2 requires authorization checks (D-05: guest browsing fully unrestricted) — the only access-control-adjacent logic is "does a session cookie exist" for header UI state, not a gate on any route |
| V5 Input Validation | Yes | Zod `.strict()` schemas at every new boundary: OTP send/verify payloads, search filter query params, language-pref updates — matching Phase 1's established convention |
| V6 Cryptography | Yes | `crypto.randomInt` (CSPRNG, not `Math.random()`) for OTP code generation; `crypto.createHmac`/`timingSafeEqual` for hash/compare; `iron-session`'s AES-based cookie sealing for session data — no hand-rolled crypto primitives anywhere in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| OTP brute-force (guessing all 1,000,000 6-digit codes against the verify endpoint) | Spoofing | Rate limit verify attempts per phone (e.g. 5 per 15 min) and lock the specific `OtpChallenge` row after N wrong attempts (increment `attemptCount`, reject once it exceeds a threshold even before expiry) — the expiry+rate-limit combination, not hash strength, is the real defense (see Alternatives Considered) |
| OTP send-flooding (SMS bombing a victim's phone number, or exhausting a future paid SMS provider's budget) | Denial of Service | Rate limit the *send* endpoint per phone AND per IP (Code Examples) — critical to design correctly now even though the dev-stub transport has no real cost, since D-03 says the transport interface should be a clean swap later without revisiting this logic |
| SQL injection via the raw `$queryRaw` ranking query (Pattern 2) | Tampering | Exclusively use `Prisma.sql`/`Prisma.join` tagged templates for every dynamic value (text query, category array, price tiers) — never string-concatenate user input into the SQL string; this mirrors Phase 1's existing raw-SQL threat pattern for the PostGIS trigger, now extended to a request-time (not just migration-time) raw query, which raises the stakes since it now executes per user request with user-controlled input |
| Session cookie forgery/tampering | Tampering | `iron-session`'s sealing (encrypt + integrity-check in one step) makes a tampered cookie fail to decrypt rather than silently decode into attacker-controlled session data — never build a custom "signed but not encrypted" cookie scheme, which would leak session shape/PII even if tamper-evident |
| Enumerating registered phone numbers via the OTP-send endpoint's response (timing or response-shape difference between "new user" and "existing user") | Information Disclosure | Return an identical response shape/timing for both "phone not yet registered" and "phone already registered" cases at the `send` step — the distinction (create vs. reuse the `User` row) should only happen after successful OTP verification, not be observable from the send response |

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view <pkg> version`, `npm view <pkg> scripts.postinstall`) — all package
  versions and postinstall-script checks in Standard Stack and Package Legitimacy Audit
- `gsd-tools query package-legitimacy check` — verdicts in Package Legitimacy Audit
- Direct repository inspection (`prisma/schema.prisma`, `lib/prisma.ts`,
  `lib/categories/category-config.ts`, `lib/hours/compute-open-now.ts` via 01-RESEARCH.md,
  `app/directory/page.tsx`, `components/directory/business-card.tsx`,
  `components/business/business-map.tsx`) — confirms exact existing patterns this phase
  extends, not assumed from memory

### Secondary (MEDIUM confidence — official docs surfaced via WebSearch, cross-checked)
- postgresql.org/docs/current/textsearch-tables.html — generated `tsvector` column + GIN index
- postgresql.org/docs/current/pgtrgm.html — `pg_trgm` extension and index operators
- prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries — `Prisma.sql` tagged-template
  raw query pattern, PostGIS/tsvector as sanctioned raw-query use cases
- github.com/vvo/iron-session — App Router `getIronSession(await cookies(), ...)` usage,
  secure cookie defaults, current version
- github.com/panva/jose — `SignJWT`/`jwtVerify`, Edge-runtime compatibility (used for
  Alternatives Considered, not the chosen library)
- NIST SP 800-63B-4 (referenced via multiple OTP-best-practice secondary sources) — 10-minute
  ceiling on out-of-band OTP validity
- Elastic.co function_score decay functions documentation (via search-result summary) —
  origin/scale/offset/decay geo-decay formula shape, adapted for the SQL `POWER(0.5, ...)`
  expression in Pattern 2
- postgis.net (via Phase 1's own research, still applicable) — `geography` vs `geometry` unit
  semantics, `ST_Distance` behavior

### Tertiary (LOW confidence — WebSearch-aggregated community sources, not individually
re-verified against a single authoritative document)
- Various dev.to/Medium articles on Prisma + Postgres full-text search patterns (used to
  corroborate the `$queryRaw` + `tsvector` approach, not as the sole source — cross-checked
  against Prisma's own official raw-queries doc)
- Various OTP-best-practice aggregator blogs (arkesel.com, mojoauth.com, messagecentral.com) —
  directionally consistent with each other and with the NIST citation; treated as MEDIUM given
  cross-source agreement on the core numbers (6 digits, 5-10 min expiry, rate limiting), not a
  single vendor's unverified claim
- Wilson score interval formula (statisticsfundamentals.com, julesjacobs.com) — mathematically
  standard, well-known statistical technique; not tied to a single canonical source but the
  formula itself is textbook-verifiable

## Metadata

**Confidence breakdown:**
- Standard stack (`iron-session`/`libphonenumber-js`/`react-hook-form`/etc. versions): HIGH —
  every version verified directly against the npm registry
- Architecture (raw-SQL ranking query, generated tsvector column, application-layer open-now
  post-filter): MEDIUM-HIGH — grounded in official Postgres/Prisma docs plus direct
  confirmation against this project's actual Phase 1 code (not assumed patterns); the exact
  ranking weights (A1) are explicitly flagged LOW/ASSUMED since no authoritative source
  prescribes them
- Auth/session (OTP design, `iron-session` usage, rate limiting): MEDIUM-HIGH — cross-source
  agreement on OTP best practices (NIST + multiple independent aggregators) plus direct
  `iron-session` GitHub documentation; the choice of HMAC over bcrypt for OTP hashing (A4) is
  a reasoned architectural judgment call, flagged accordingly
- Pitfalls (rating-term absence, N+1 risk, ts_rank normalization, rate-limiter statefulness):
  MEDIUM-HIGH — directly derived from this phase's own CONTEXT.md (D-02) and Phase 1's
  documented pitfall history, not speculative

**Research date:** 2026-09-13
**Valid until:** 30 days for the architectural/pattern guidance; treat exact npm package
versions as valid only at plan time — re-run `npm view` if planning is delayed more than
~1-2 weeks, consistent with Phase 1's own guidance on this actively-shipping stack.
