# LankaReview — Project Handoff

> Portable status doc for any coding agent (Claude Code, Cursor, Copilot, etc.) to pick up
> this project and continue implementing. Written 2026-09-15 after Phase 3 completed.
> Source of truth for planning artifacts lives in `.planning/` (`PROJECT.md`,
> `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, per-phase `SUMMARY.md`/`VERIFICATION.md`
> files) — this doc is a synthesized snapshot, not a replacement for those.

---

## 1. What This Is

**LankaReview** — a two-sided local marketplace for Sri Lanka ("Yelp for Sri Lanka").
Consumers search, browse, and read crowd-sourced reviews/photos/ratings of local
businesses to decide where to eat, shop, or hire a service, for free. Businesses get a
free listing page and (in a future milestone) pay for ads/SaaS/enhanced profiles. Launch
vertical: restaurants & food in Colombo.

**Core value (never compromise this):** The free consumer review/search product must
stay trustworthy and useful — that trust is the asset every future business-side revenue
stream is sold against. Every review-filtering / moderation decision in this codebase is
built around that principle: filtered content is never silently deleted, the author is
never told in real time whether they were filtered, and nothing about ranking or
moderation can be gamed by an advertiser (there are no ads yet, but the architecture
already assumes ads and organic ranking must someday be provably separate).

**Current milestone scope:** Consumer MVP only — no payments, ads, or business dashboard
yet. That's all deliberately out of scope until this milestone ships. Full original spec
context (why things are shaped this way) lives in `.planning/PROJECT.md`.

---

## 2. Tech Stack (as actually built, not just planned)

- **Framework:** Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript
- **Styling/UI:** Tailwind CSS v4, shadcn/ui (`radix-vega` preset — neutral base,
  `lucide-react` icons), `components.json` already initialized — use `npx shadcn add
  <component>` for new primitives, don't hand-roll ones that already exist in the
  registry (though note: the shadcn CLI has silently no-op'd on at least one component —
  `form` — in this project before; if `npx shadcn add X` produces zero files and exits 0,
  don't assume it worked, check `components/ui/` and hand-write if needed, matching this
  project's existing `radix-ui`/`cn` import conventions)
- **DB:** Postgres 16 + PostGIS 3.5, local via `docker-compose.yml` (pinned
  `platform: linux/amd64` — no arm64 manifest exists for `postgis/postgis`)
- **ORM:** Prisma 7.10.0 with the **required** `@prisma/adapter-pg` driver adapter
  (Prisma 7 removed the bundled Rust query engine — `lib/prisma.ts` is the singleton,
  always import from there, never instantiate `PrismaClient` directly elsewhere)
- **Search:** Postgres native full-text search (`tsvector` generated column + GIN index)
  + `pg_trgm` fuzzy fallback — deliberately NOT OpenSearch/Elasticsearch (bootstrap-budget
  decision, ~107-1000s of rows doesn't justify a search cluster; see PROJECT.md Key
  Decisions). Geo: dual-column pattern — plain `latitude`/`longitude` floats for app code
  + a trigger-synced `geography(Point,4326)` column for `ST_DWithin`/distance queries.
- **Auth:** Phone-OTP only (no email/password, no OAuth). `iron-session` sealed httpOnly
  cookies (not JWT-in-localStorage). OTP hashed via HMAC-SHA256 + `timingSafeEqual`,
  rate-limited (in-memory limiter — `lib/rate-limit/in-memory-limiter.ts` — swap for
  Redis/`@upstash/ratelimit` before real production scale). **SMS transport is a
  dev-mode console-log stub** (`lib/otp/transport.ts` — `ConsoleOtpTransport`) — no real
  SMS provider is wired or paid for yet; swapping in Notify.lk/Dialog later only requires
  implementing the `OtpTransport` interface.
- **Testing:** Vitest 5.0.0 (unit/component) + Playwright 1.63.0 (e2e) — both configured,
  run `npm test` and `npm run test:e2e`
- **Key libs:** `luxon` (all date/time — never raw `Date` math for hours/timezone logic),
  `zod` v4 (`.strict()` schemas everywhere for validated input), `react-hook-form` +
  `@hookform/resolvers`, `libphonenumber-js`, `input-otp`, `leaflet`/`react-leaflet`

**Full dependency list:** see `package.json`.

**Execution model note:** Worktree isolation is **disabled**
(`.planning/config.json`'s `workflow.use_worktrees: false`) — every executor agent that
built this ran sequentially on the main working tree with atomic per-task git commits,
not in parallel git worktrees. If you're a GSD-aware agent picking this up, keep that
setting unless you have a real reason for true parallelism.

---

## 3. What's Built (Phases 1-3, all verified complete)

### Phase 1 — Business Directory Foundation ✅
Structured business listings: name, categories (primary+secondary, 16-leaf taxonomy
incl. Sri Lanka-specific ones — tuk repair, tutoring, wedding vendors, tailoring),
description, district/DS-division address (no ZIP) + lat/lng map pin, 7-day structured
hours with split shifts + holiday overrides + live open/closed computation
(`lib/hours/compute-open-now.ts` — handles overnight-crossing shifts correctly, this was
a deliberately tricky piece, don't touch without reading its tests first), category-
conditional attributes (flexible jsonb + static TS config in
`lib/categories/category-config.ts`, not a DB table), photo gallery + restaurant-only
menu tab (photos only, no structured MenuItem entity), 107 real hand-curated Colombo
businesses seeded across all 16 categories.

### Phase 2 — Search, Discovery & Accounts ✅
Free-text + geo search (`lib/search/run-search-query.ts`) with filters (category, price
tier, open-now, distance radius, rating threshold, category attributes) and 4 sort
options (Recommended/Highest Rated/Most Reviewed/Distance). "Recommended" sort blends
text relevance + geo-decay + a rating term — architecturally isolated so a future ad
layer can interleave without touching this code. Home page with 3 discovery rails
(Trending Near You — stable-hash sample, New Businesses, Category Shortcuts —
**deliberately no "Top Rated" rail**, see Key Decisions below). Phone-OTP auth, fully
unrestricted guest browsing (zero login prompts anywhere), progressive profile,
`language_pref` scaffolding + header switcher (English complete, Sinhala/Tamil
structurally supported but **no translated strings exist yet** — that's real
future work, not done).

### Phase 3 — Reviews & Ratings ✅
Write/edit one review per user per business (DB-enforced unique constraint), rating
1-5 + text (50-char min) + optional photos (URL strings only, no upload infra).
**The single most important piece of code in this phase:** a rules-based review filter
(`lib/reviews/review-filter.ts`) that classifies every review `recommended` /
`not_recommended` synchronously at publish/edit time — the API response shape
(`lib/reviews/author-review-response.ts`) is structurally incapable of leaking the
outcome to the author (a single shared serializer with a hard-coded field allowlist,
not a "remember not to leak it" discipline). Not-recommended reviews are never deleted,
just excluded from the public average — always reachable via the "X reviews not
currently recommended" disclosure link (`components/reviews/review-list.tsx`). Filter
signals (account age, burst-posting, text-similarity) are logged as structured JSON
(`filterSignals` column) for a future advertiser-parity audit. Default review sort
blends recency + reviewer credibility + a currently-neutral helpfulness placeholder
(`lib/reviews/sort-reviews.ts` — the `HELPFULNESS_SCORE_NEUTRAL` constant is exactly
what Phase 4 replaces with real vote data), with Newest/Highest/Lowest override.
Text-only profanity/PII moderation gate (`lib/moderation/classify-content.ts`) —
**photo moderation is NOT implemented** (formally accepted deviation, documented in
`.planning/phases/03-reviews-ratings/03-VERIFICATION.md` — no photo caption/content
exists yet to moderate, only bare URLs; do this for real once Phase 5 adds upload
infra). Real `avgRating`/`reviewCount` are now wired into Phase 2's search ranking,
replacing the placeholder neutral value.

**Test count as of Phase 3 complete:** 187/189 vitest tests passing, 4/4 e2e specs
passing, `npm run build` clean. **The 2 known-failing tests are pre-existing,
documented, out-of-scope flakiness** — see Known Issues below, do not "fix" them as
part of unrelated work without reading that section first.

---

## 4. What's Left (Phases 4-5, not started)

### Phase 4 — Voting, Owner Response & Reporting
**Goal:** Users can react to reviews, verified business owners can respond publicly, and
anyone can report bad content.
**Requirements:** VOTE-01, VOTE-02, CLAIM-01, MOD-02

1. **VOTE-01:** Useful/Funny/Cool as three independent toggle votes on any review
   (anyone can vote, not just logged-in-with-history users — check REQUIREMENTS.md for
   exact auth requirement). This is the direct trigger to go replace
   `sort-reviews.ts`'s `HELPFULNESS_SCORE_NEUTRAL` constant with a real computed score —
   that's a one-constant swap once real vote data exists, per Phase 3's own decision log.
2. **CLAIM-01:** Minimal business claim — phone-OTP verification to the business's listed
   number is sufficient to unlock owner-response rights. **Do NOT build full Business
   Registration document upload/verification** — that's explicitly v2/out-of-scope per
   REQUIREMENTS.md (`### Business Claim (minimal, owner-response only)` section — read
   the exact wording there).
3. **VOTE-02:** Once claimed, the verified owner can post exactly one public "Response
   from the owner" reply per review.
4. **MOD-02:** One-tap Report/Flag on any review, photo, or business with a reason
   picker. Reporter gets a submission confirmation only — **no visibility into the
   outcome** (same secrecy principle as REV-03's review filter — don't let reporting be
   used to harass by revealing whether a report "worked").

### Phase 5 — Rich Content (Photos, Q&A & Collections)
**Goal:** Business pages get richer via community contributions.
**Requirements:** PHOTO-01, PHOTO-02, QA-01, COLL-01, COLL-02

1. **PHOTO-01/02:** Any logged-in user (not just reviewers) can upload a photo to a
   business page; real automated moderation (NSFW/irrelevance) before it goes live.
   **This is the phase that should finally add real upload infrastructure** — once it
   exists, go back and close Phase 3's accepted MOD-01 photo-moderation deviation for
   real, and consider migrating `ReviewCard`'s photo rendering from plain `<img>` to
   `next/image` (currently blocked because `next.config.ts`'s `images.remotePatterns` is
   locked to `picsum.photos` only for security — widen it once photos live on a
   controlled/owned domain, not arbitrary reviewer-supplied URLs).
2. **QA-01:** Q&A on business pages — any user asks, any user (incl. owner) answers,
   answers are votable, top-voted surfaces first.
3. **COLL-01/02:** Save a business to a default or named list; make any collection public
   via a shareable link.

Full original requirement text (more precise than this summary) is in
`.planning/REQUIREMENTS.md`. Full phase goals/success-criteria are in
`.planning/ROADMAP.md`.

---

## 5. How This Project Has Been Built — Workflow to Continue With

**For Phases 1-2:** full ceremony — discuss-phase (gray-area decisions captured in
`NN-CONTEXT.md`), phase research (`NN-RESEARCH.md`), UI design contract
(`NN-UI-SPEC.md`), then a planner + plan-checker loop producing `NN-NN-PLAN.md` files,
then execution.

**For Phases 3 onward (explicit project-owner instruction, 2026-09-15):** skip that
ceremony entirely. The original spec supplied at project init was already deep enough
that separate planning documents were pure overhead. Instead: **read the ROADMAP.md
phase goal + REQUIREMENTS.md requirement IDs + relevant existing code, then implement
directly** — no `PLAN.md`, no `CONTEXT.md`, no `RESEARCH.md`, no `UI-SPEC.md` for Phases
3-5. Still keep:
- **Atomic git commits** per logical unit of work (schema change, one feature, tests)
- **Real tests**, TDD (RED commit then GREEN commit) for non-trivial logic — this
  codebase's convention throughout
- **A `SUMMARY.md`** per implementation chunk, written to
  `.planning/phases/NN-slug/NN-<chunk-name>-SUMMARY.md`, documenting what was built and
  any deviations/decisions made
- **Build/test gates** after each chunk: `npm run build`, `npx vitest run`, `npx
  playwright test` — all must be clean (or only the known pre-existing flaky tests
  failing, see below) before considering a chunk done
- **A goal-backward verification pass** at the end of each phase (did we actually
  achieve the ROADMAP goal, not just "did tasks get marked done") — write
  `.planning/phases/NN-slug/NN-VERIFICATION.md`. If using GSD tooling, this is exactly
  what `gsd-verifier` does; if not, do the equivalent manually: re-read the actual
  source (not your own summary) against each success criterion.
- **Update `.planning/REQUIREMENTS.md`** checkboxes, `.planning/ROADMAP.md` progress
  table, and `.planning/STATE.md` as you go, and evolve `.planning/PROJECT.md`'s
  Requirements/Key Decisions sections after each phase closes.

**If you're a GSD-aware agent (Claude Code with the GSD skill set installed):** you can
still use `gsd-tools.cjs query phase.complete "<N>"` to formally close a phase (updates
ROADMAP/STATE/REQUIREMENTS atomically) even without having run `/gsd-plan-phase` for it.

**If you're NOT GSD-aware (e.g. a Cursor agent with no GSD tooling):** none of the above
requires GSD specifically — it's just: read ROADMAP.md + REQUIREMENTS.md for the target
phase, read the relevant existing code, implement with tests and atomic commits, then
hand-update the three tracking files' checkboxes/status to reflect what you did. The
`.planning/` markdown files are plain, human/agent-readable text — no special tooling
required to read or edit them.

---

## 6. Known Issues / Things to Not Re-Break

1. **2 pre-existing flaky tests** in `lib/search/run-search-query.test.ts` (the
   `open-now application-layer post-filter` describe block) — they use a real-clock
   overnight-shift fixture with a daytime gap (09:00-18:00 Colombo) where the assertion
   is simply wrong regardless of code correctness. Documented root cause and fix path in
   `.planning/phases/03-reviews-ratings/deferred-items.md`. A real fix needs `now`
   threaded through `runSearchQuery`'s public API (a small, real feature change) or
   redesigned fixtures — don't attempt a quick patch without reading that file first, a
   previous attempt at a quick fix (vitest fake timers) didn't work for reasons not
   fully root-caused.
2. **Prisma migration trap (hit 3 times already — 01-01, 02-01, 03-backend):** running
   `npx prisma migrate dev` auto-generates `DROP INDEX`/`DROP DEFAULT` statements against
   hand-written raw SQL objects this project uses (the PostGIS `geography` column, its
   GiST index, the `sync_business_location` trigger, the generated `tsvector` column and
   its GIN index, the `pg_trgm` index) because Prisma's schema diff doesn't understand
   `Unsupported(...)` column internals. **Always read the generated migration SQL before
   applying it** — if you see a `DROP INDEX` on `Business_location_gist`,
   `business_searchable_gin_idx`, `business_name_trgm_idx`, or a `DROP DEFAULT` on the
   `searchable` column, remove those lines from the migration file before running it.
3. **shadcn CLI unreliability:** `npx shadcn add form` silently exited 0 and wrote zero
   files once in this project (cause not diagnosed). If a shadcn add command produces no
   new file, don't assume success — check `components/ui/` and hand-write the component
   matching this project's existing `radix-ui`/`cn` import style if needed.
4. **`next.config.ts`'s `images.remotePatterns`** is deliberately locked to
   `picsum.photos` only (a real security decision, T-03-02) — don't widen it for
   arbitrary user-supplied URLs without real justification (see Phase 5 notes above for
   when this should change).
5. **The REV-03 secrecy principle is load-bearing across the whole product,** not just
   Phase 3 — if you touch anything in the review create/edit path, preserve the rule
   that the author-facing API response can never reveal `visibilityStatus`/
   `filterReason`/`filterSignals`. The pattern to follow is
   `lib/reviews/author-review-response.ts`'s single shared serializer — extend that
   file's allowlist rather than adding a second response-building code path.
6. **Docker Postgres must be running** for almost anything to work locally —
   `docker compose up -d` (check `docker-compose.yml`). `.env`/`.env.example` have the
   connection string plus `OTP_HMAC_SECRET`/`SESSION_SECRET`.

---

## 7. Key File Map

| What | Where |
|---|---|
| Full original product spec context | `.planning/PROJECT.md` |
| All requirements (checked = done) | `.planning/REQUIREMENTS.md` |
| Phase goals/success criteria | `.planning/ROADMAP.md` |
| Current position/session state | `.planning/STATE.md` |
| Per-phase build record | `.planning/phases/NN-slug/*-SUMMARY.md` |
| Per-phase goal verification | `.planning/phases/NN-slug/*-VERIFICATION.md` |
| DB schema | `prisma/schema.prisma` |
| Seed data | `prisma/seed-data/businesses.json`, `prisma/seed.ts` |
| Auth/session | `lib/session.ts`, `lib/otp/*`, `app/api/auth/**` |
| Search | `lib/search/run-search-query.ts` |
| Reviews | `lib/reviews/*`, `app/api/reviews/**` |
| Moderation | `lib/moderation/classify-content.ts` |
| Category taxonomy | `lib/categories/category-config.ts` |
| Hours/open-now | `lib/hours/compute-open-now.ts` |
| Design system reference | `.planning/phases/01-business-directory-foundation/01-UI-SPEC.md`, `.planning/phases/02-search-discovery-accounts/02-UI-SPEC.md` |

---

## 8. Quick Start for a New Agent Session

```bash
cd /path/to/taggy
docker compose up -d          # start Postgres+PostGIS
npm install
npx prisma generate
npm run dev                   # http://localhost:3000
npm test                      # vitest — expect 187/189 (2 known flaky, see §6.1)
npm run test:e2e              # playwright — expect all passing
```

Read `.planning/PROJECT.md` and `.planning/ROADMAP.md`'s Phase 4 section, then start
implementing per §5 above.
