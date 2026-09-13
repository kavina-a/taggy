# Walking Skeleton — LankaReview

**Phase:** 1
**Generated:** 2026-09-13

## Capability Proven End-to-End

A visitor can open the directory index at `/directory`, see real seeded Colombo businesses,
click into one, and view its name, categories, description, and district/free-text address
with an accurate Leaflet map pin at its lat/lng — served by Next.js Server Components reading
Postgres through Prisma, with the seed data having been written through the same Prisma
client. This is delivered by plan `01-01-PLAN.md`; plans `01-02` through `01-04` add the rest
of Phase 1's scope (hours/open-now, category attributes, photo gallery + menu tab, and the
full 100-300-business seeded dataset) on top of this proven stack without changing any
architectural decision below.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Tailwind v4, shadcn `new-york`/`neutral`) | Locked by `01-UI-SPEC.md`; SSR/SSG matters from line one since business pages are the long-term organic-discovery surface |
| Directory layout | Root-level `app/`, `components/`, `lib/`, `prisma/`, `e2e/` — **no `src/` directory** | Matches the exact file paths locked in `01-VALIDATION.md`'s Per-Task Verification Map (e.g. `lib/hours/compute-open-now.test.ts`, not `src/lib/...`) — deviates from `01-RESEARCH.md`'s illustrative `--src-dir` install command for this reason |
| Data layer | Postgres 16 + PostGIS 3.5 via the official `postgis/postgis:16-3.5` Docker image (local dev) + Prisma 7 ORM | Zero-cost, zero-account local dev (bootstrap budget); dual-column geo storage (plain `latitude`/`longitude` Float columns + a DB-trigger-synced `geography(Point,4326)` column declared via Prisma `Unsupported()`) so Phase 2's distance/geo-decay search doesn't require a data migration |
| Auth | None in Phase 1 | Deferred to Phase 2 (AUTH-01/02/03) — all Phase 1 data is public, read-only, unclaimed seeded listings |
| Category attributes | Single `jsonb` column (`Business.attributes`) validated against a static TypeScript config (`lib/categories/category-config.ts`), not a DB table | Per CONTEXT.md D-02; no admin UI exists yet to justify a DB-backed config |
| Menu representation | `BusinessPhoto.isMenuPhoto` boolean flag, no `MenuItem` entity | Per CONTEXT.md D-03 |
| Deployment target | Local dev only: `docker compose up -d db && npx prisma migrate dev && npx prisma db seed && npm run dev` | No production hosting decision required for Phase 1 (no revenue, no external users yet); `01-RESEARCH.md` explicitly defers the Neon-vs-Supabase-vs-self-hosted choice to Phase 2 planning time — Postgres data is portable via `pg_dump`/`pg_restore` regardless of what's chosen then |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 16 + Tailwind v4 + shadcn init + Vitest + Playwright configured) — `01-01-PLAN.md` Task 1
- [x] Routing — `/directory` and `/business/[slug]` real routes — `01-01-PLAN.md` Task 3
- [x] Database — real read (`prisma.business.findUnique`/`findMany`) AND real write (`prisma/seed.ts` upserts) — `01-01-PLAN.md` Tasks 2-3
- [x] UI — real interactive element: business card → business page navigation (Next.js `Link`) + Leaflet map pan/zoom — `01-01-PLAN.md` Task 3
- [x] Deployment — documented local full-stack run command (Docker Compose + `npm run dev`) — `01-01-PLAN.md` Task 1

## Out of Scope (Deferred to Later Slices)

- React Native mobile app — deferred past Phase 1 per CONTEXT.md D-01, once the Phase 1/2 API is stable.
- Structured `MenuItem` entity (name/price/description) — deferred past v1 per CONTEXT.md D-03.
- OpenStreetMap-based or scraped seed data pipeline — not chosen for Phase 1 per CONTEXT.md D-04.
- Production cloud hosting/deploy target (Neon vs Supabase vs self-hosted Postgres beyond local Docker) — no Phase 1 requirement forces this choice; revisit at Phase 2 planning per `01-RESEARCH.md` Open Question #2.
- Search, filters, sort, ranking (Phase 2 SRCH-01..06).
- Accounts, phone-OTP auth, guest-vs-logged-in state (Phase 2 AUTH-01..03).
- Reviews, ratings, review filter (Phase 3). Voting, owner claim/response, reporting (Phase 4). User-uploaded photos, Q&A, collections (Phase 5).

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Search, Discovery & Accounts — search/filter/sort over the directory this phase built, plus guest browsing and phone-OTP signup.
- Phase 3: Reviews & Ratings — write/edit reviews with a synchronous, secret review filter.
- Phase 4: Voting, Owner Response & Reporting — review voting, owner claim via phone OTP, one-tap report/flag.
- Phase 5: Rich Content — Photos, Q&A & Collections — user-uploaded photos with moderation, Q&A, shareable saved-place collections.
