---
phase: 02-search-discovery-accounts
plan: 01
subsystem: database
tags: [prisma, postgres, postgis, pg_trgm, tsvector, otp, crypto, vitest, shadcn, iron-session, react-hook-form]

# Dependency graph
requires:
  - phase: 01-business-directory-foundation
    provides: "Prisma schema (Business/BusinessHours/BusinessHoursOverride/BusinessPhoto), lib/prisma.ts driver-adapter singleton, Unsupported()-plus-hand-edited-migration-SQL precedent for the geography(Point,4326) column"
provides:
  - "4 new npm deps (iron-session, libphonenumber-js, react-hook-form, @hookform/resolvers) + 11 new shadcn UI primitives under components/ui/"
  - "Business.searchable generated tsvector column (name+description, weighted A/B) + GIN index; pg_trgm extension + name trigram GIN index"
  - "User and OtpChallenge Prisma models, migrated to local Postgres"
  - "OTP_HMAC_SECRET / SESSION_SECRET in .env (real) and .env.example (placeholder)"
  - "lib/otp/generate.ts (generateOtpCode/hashOtpCode/verifyOtpCode/OTP_EXPIRY_MS) and lib/otp/otp.schema.ts (sendOtpSchema/verifyOtpSchema)"
affects: [02-02-search-engine, 02-03-auth-core]

# Tech tracking
tech-stack:
  added: ["iron-session@9.0.1", "libphonenumber-js@1.13.13", "react-hook-form@7.88.0", "@hookform/resolvers@5.9.1", "input-otp@1.5.0 (via shadcn)"]
  patterns:
    - "Generated-column-plus-hand-edited-migration-SQL for Postgres features Prisma's schema DSL can't express natively (tsvector GENERATED ALWAYS AS ... STORED), same technique Phase 1 established for the geography(Point,4326) column"
    - "HMAC-SHA256 + timingSafeEqual for short-lived, small-keyspace secret hashing (OTP codes) instead of bcrypt — documented in 02-RESEARCH.md's Alternatives Considered"
    - "dotenv/config imported in vitest.setup.ts so process.env.* secrets from .env are available to any test, mirroring the same dotenv/config pattern lib/prisma.ts and prisma7.config.ts already use"

key-files:
  created:
    - prisma/migrations/20260915000009_add_search_and_auth/migration.sql
    - lib/otp/generate.ts
    - lib/otp/generate.test.ts
    - lib/otp/otp.schema.ts
  modified:
    - package.json
    - package-lock.json
    - prisma/schema.prisma
    - .env.example
    - .env
    - vitest.setup.ts
    - "components/ui/*.tsx (11 new shadcn primitives)"

key-decisions:
  - "Removed Prisma's auto-generated `DROP INDEX \"Business_location_gist\"` from the migrate --create-only scaffold before applying — Prisma's diff treats the hand-added GiST index (added outside declarative schema tracking in 01-01, same as this plan's own tsvector/trigram indexes) as drift and would have deleted it, silently regressing the geo-distance query Phase 2's search/geo-decay ranking depends on"
  - "Added dotenv/config to vitest.setup.ts (global test setup) rather than per-test-file env stubbing, so OTP_HMAC_SECRET/SESSION_SECRET (and any future real secret) is available to every test the same way it already is for standalone Node scripts via lib/prisma.ts"
  - "hashOtpCode/verifyOtpCode use Node's built-in node:crypto (createHmac, timingSafeEqual) per 02-RESEARCH.md's explicit rejection of bcrypt for OTP hashing — no new npm dependency, and verifyOtpCode returns false (rather than throwing) on unequal-length hash comparison"

patterns-established:
  - "Business.searchable / Business_location_gist coexistence proves the Unsupported()-plus-raw-migration-SQL pattern composes across multiple hand-added indexes on the same table without Prisma's diff engine destroying earlier ones, as long as each `migrate dev --create-only` scaffold is reviewed for unintended DROP statements before being applied"

requirements-completed: [AUTH-01, LOC-01]

coverage:
  - id: D1
    description: "npm install + shadcn CLI additions succeed and `npm run build` still compiles cleanly with the new Phase 2 dependencies present"
    verification:
      - kind: other
        ref: "npm run build (exit 0, Next.js 16.3.5 Turbopack production build succeeds after a clean node_modules reinstall)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit (exit 0, no type errors)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Phase 2 Prisma migration (User/OtpChallenge tables, Business.searchable generated tsvector column + GIN index, pg_trgm + name trigram index) applies cleanly against the running local Postgres and `npx prisma migrate status` reports up to date, without dropping Phase 1's existing Business_location_gist index"
    requirement: "AUTH-01"
    verification:
      - kind: integration
        ref: "npx prisma migrate status (reports 'Database schema is up to date!', 3 migrations found)"
        status: pass
      - kind: integration
        ref: "docker compose exec db psql -U postgres -d lankareview -c '\\d \"Business\"' — confirms searchable generated column + business_searchable_gin_idx + business_name_trgm_idx + preserved Business_location_gist"
        status: pass
      - kind: integration
        ref: "docker compose exec db psql -U postgres -d lankareview -c '\\dt' — confirms User and OtpChallenge tables exist; '\\dx' confirms pg_trgm extension installed"
        status: pass
    human_judgment: false
  - id: D3
    description: "generateOtpCode/hashOtpCode/verifyOtpCode round-trip correctly via HMAC-SHA256 + timingSafeEqual and never store a plaintext OTP code anywhere"
    requirement: "AUTH-01"
    verification:
      - kind: unit
        ref: "lib/otp/generate.test.ts (7/7 tests pass: 6-digit zero-padded format across 50 samples, hash determinism, hash-never-equals-plaintext, verify true/false round trip, unequal-length-hash returns false without throwing, OTP_EXPIRY_MS === 300000)"
        status: pass
    human_judgment: false

duration: 42min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 01: Shared Foundation — Deps, Schema, OTP Primitives Summary

**Prisma schema extended with a generated tsvector search column + pg_trgm trigram index and User/OtpChallenge auth tables (both migrated to local Postgres), plus HMAC-SHA256-based OTP hashing primitives — the one-time shared infrastructure both Search and Auth verticals build on next.**

## Performance

- **Duration:** 42 min total across two sessions — Task 1 (npm/shadcn install) ran in an earlier session that stalled before committing its own SUMMARY; Task 1's commit (`dcbcc84`) landed separately, then this session picked up from Task 2 through completion in ~9 min (05:28–05:38 local)
- **Started:** 2026-09-14T23:58:56Z (Task 1 commit) / this session began immediately after
- **Completed:** 2026-09-15T00:07:50Z
- **Tasks:** 3
- **Files modified:** package.json, package-lock.json, 11 shadcn `components/ui/*.tsx` files, prisma/schema.prisma, 1 new migration.sql, .env, .env.example, vitest.setup.ts, lib/otp/generate.ts, lib/otp/generate.test.ts, lib/otp/otp.schema.ts (18 total)

## Accomplishments
- 4 new npm packages (iron-session, libphonenumber-js, react-hook-form, @hookform/resolvers) and 11 shadcn UI primitives installed; `npm run build` compiles cleanly
- `Business.searchable` generated `tsvector` column (weighted name/description) + GIN index live in Postgres, alongside a `pg_trgm` name-trigram fallback index — without regressing Phase 1's existing `Business_location_gist` geo index
- `User` and `OtpChallenge` tables migrated; `OTP_HMAC_SECRET`/`SESSION_SECRET` generated and stored in `.env` (real values, gitignored) and `.env.example` (placeholders, committed)
- `lib/otp/generate.ts` OTP primitives (generation, HMAC-SHA256 hashing, constant-time verification, 5-minute expiry) proven correct via 7 passing tests, never touching a plaintext code
- `lib/otp/otp.schema.ts` Zod `.strict()` payload schemas for the upcoming send/verify OTP routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Phase 2 npm dependencies and shadcn UI primitives** - `dcbcc84` (feat) — completed in a prior, separately-committed session after the first execution attempt stalled before writing this SUMMARY
2. **Task 2 [BLOCKING]: Extend Prisma schema with search indexes + auth tables, migrate, add secrets** - `b6df625` (feat)
3. **Task 3: OTP code generation and hashing primitives** - `6f18244` (test, RED) → `99975f9` (feat, GREEN)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `package.json` / `package-lock.json` - 4 new runtime deps + shadcn's own transitive Radix additions
- `components/ui/{input,label,select,dropdown-menu,sheet,checkbox,slider,input-otp,avatar,dialog,form}.tsx` - 11 new shadcn primitives (Task 1)
- `prisma/schema.prisma` - `Business.searchable` field + GIN index; new `User`, `OtpChallenge` models
- `prisma/migrations/20260915000009_add_search_and_auth/migration.sql` - `pg_trgm` extension, generated `tsvector` column, `User`/`OtpChallenge` tables, GIN + trigram indexes (hand-edited to remove an unintended `DROP INDEX` on the existing geo index)
- `.env.example` - `OTP_HMAC_SECRET=`/`SESSION_SECRET=` placeholder lines
- `.env` - real generated secret values (gitignored, never committed)
- `lib/otp/generate.ts` - `generateOtpCode`, `hashOtpCode`, `verifyOtpCode`, `OTP_EXPIRY_MS`
- `lib/otp/generate.test.ts` - 7 behavior tests (TDD RED→GREEN)
- `lib/otp/otp.schema.ts` - `sendOtpSchema`, `verifyOtpSchema`
- `vitest.setup.ts` - added `import "dotenv/config"` so tests can read real `.env` secrets

## Decisions Made

- Removed the auto-generated `DROP INDEX "Business_location_gist"` statement from the `migrate --create-only` scaffold before applying it — Prisma's schema diff considers any index not declared via `@@index(...)` in `schema.prisma` to be drift and would have silently deleted Phase 1's geo index, which Phase 2's search ranking query depends on
- Added `dotenv/config` to the global `vitest.setup.ts` (not per-test stubbing) so `process.env.OTP_HMAC_SECRET`/`SESSION_SECRET` resolve from the real `.env` file in every test, matching the project's existing `dotenv/config` convention (`lib/prisma.ts`, `prisma7.config.ts`)
- Kept OTP hashing on Node's built-in `crypto` (HMAC-SHA256 + `timingSafeEqual`) per 02-RESEARCH.md's explicit bcrypt rejection — no new dependency, and `verifyOtpCode` returns `false` rather than throwing on a length-mismatched hash

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed Prisma's unintended `DROP INDEX` on the existing geo index**
- **Found during:** Task 2, after `npx prisma migrate dev --create-only --name add_search_and_auth`
- **Issue:** Prisma's schema diff emitted `DROP INDEX "Business_location_gist";` at the top of the generated migration, because that index was hand-added via raw SQL in Phase 1's `add_geography` migration and isn't declared via `@@index(...)` in `schema.prisma` — Prisma's diff engine treats it as unmanaged drift to reconcile away. Applying this as-generated would have deleted the index Phase 2's `ST_Distance`-based geo-decay ranking query (02-RESEARCH.md Pattern 2) needs.
- **Fix:** Deleted the `DROP INDEX` line from the generated `migration.sql` before applying, while keeping every other statement Prisma generated (User/OtpChallenge table DDL, GIN indexes) untouched
- **Files modified:** `prisma/migrations/20260915000009_add_search_and_auth/migration.sql`
- **Verification:** `docker compose exec db psql ... -c '\d "Business"'` confirms `Business_location_gist` still present alongside the two new indexes; `npx prisma migrate status` reports up to date
- **Committed in:** `b6df625`

**2. [Rule 3 - Blocking] Re-resolved the documented npm optional-dependency rollup bug**
- **Found during:** Task 3, first `npx vitest run lib/otp/generate.test.ts` attempt
- **Issue:** `Cannot find module '@rollup/rollup-darwin-arm64'` — the same documented npm optional-deps bug (npm/cli#4828) Phase 1's 01-01/01-02 SUMMARYs already hit and fixed once; it resurfaced after this session's earlier `npm install`/`shadcn add` activity
- **Fix:** Removed `node_modules` and `package-lock.json`, ran a clean `npm install` (same fix Phase 1 documented)
- **Files modified:** `package-lock.json`
- **Verification:** `npx vitest run lib/otp/generate.test.ts` proceeds past module resolution; `npm run build` and `npx tsc --noEmit` both succeed afterward
- **Committed in:** `6f18244`

**3. [Rule 3 - Blocking] `process.env.OTP_HMAC_SECRET` was undefined inside Vitest**
- **Found during:** Task 3, GREEN phase — `hashOtpCode`/`verifyOtpCode` tests threw `TypeError: The "key" argument must be of type string ... Received undefined`
- **Issue:** Vite/Vitest does not automatically load a project's `.env` file into `process.env` for Node-side test code (only `import.meta.env` for `VITE_`-prefixed vars) — even though `.env` already contained the real `OTP_HMAC_SECRET` value from Task 2, the test runner never read it
- **Fix:** Added `import "dotenv/config";` as the first line of `vitest.setup.ts`, reusing the exact pattern `lib/prisma.ts` and `prisma7.config.ts` already use for standalone Node scripts (the `dotenv` package was already a project dependency, no new install)
- **Files modified:** `vitest.setup.ts`
- **Verification:** `npx vitest run lib/otp/generate.test.ts` — 7/7 pass; full `npx vitest run` — 39/39 pass across all 6 test files
- **Committed in:** `99975f9`

---

**Total deviations:** 3 auto-fixed (1 Rule 1 bug, 2 Rule 3 blocking)
**Impact on plan:** All three were reactions to tooling drift/gaps (Prisma's diff-drift on an unmanaged index, a previously-documented npm optional-deps bug, Vite's non-standard `.env`-loading behavior for `process.env`) rather than scope changes. No architectural changes; the schema shape and OTP primitive signatures specified in the plan are unchanged.

## Issues Encountered

- `npx prisma migrate dev` (no flags) hung indefinitely with no output when applying the migration, exactly as documented in 01-01-SUMMARY.md — killed the background process and confirmed via `npx prisma migrate status` (reports up to date) and direct `psql` inspection that the migration had, in fact, already applied cleanly before the hang.

## User Setup Required

None — no external service configuration required. Local dev only: `docker compose up -d db && npx prisma migrate deploy` (already applied) with `.env`'s `OTP_HMAC_SECRET`/`SESSION_SECRET` in place.

## Next Phase Readiness

- `prisma/schema.prisma` and `package.json` are now stable for 02-02 (Search Engine) and 02-03 (Auth Core) to build against in parallel with zero file contention, per this plan's stated purpose
- `lib/otp/generate.ts`/`otp.schema.ts` are ready for 02-03's OTP send/verify Route Handlers to import directly
- `Business.searchable`/trigram indexes are ready for 02-02's `runSearchQuery()` raw-SQL function
- No blockers. One thing to carry forward: the npm optional-dependency rollup bug (npm/cli#4828) has now recurred twice in this project — future sessions hitting `Cannot find module '@rollup/rollup-<platform>'` should go straight to the documented `rm -rf node_modules package-lock.json && npm install` fix rather than re-diagnosing from scratch.

## Self-Check: PASSED

All 4 key created files (`prisma/migrations/20260915000009_add_search_and_auth/migration.sql`,
`lib/otp/generate.ts`, `lib/otp/generate.test.ts`, `lib/otp/otp.schema.ts`) confirmed present on
disk. All 4 task commits (`dcbcc84`, `b6df625`, `6f18244`, `99975f9`) confirmed present in
`git log`.

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
