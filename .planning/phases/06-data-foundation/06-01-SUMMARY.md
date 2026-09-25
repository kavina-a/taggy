---
phase: 06-data-foundation
plan: 01
subsystem: database
tags: [prisma, postgres, zod, migration]

# Dependency graph
requires:
  - phase: 05-rich-content-photos-qa-collections
    provides: Business/User/Review/BusinessPhoto/ReviewPhoto models this plan extends; existing migration-trap precedent (5th occurrence)
provides:
  - "Business.guaranteed/responseTimeMinutes/responseRate/isTest fields"
  - "User.eliteYear/avatarUrl/city/friendCount/reviewCount/photoCount/isTest fields"
  - "Review.isTest field"
  - "PhotoTag enum + BusinessPhoto.tag/ReviewPhoto.tag fields"
  - "businessSeedSchema extended with guaranteed/responseTimeMinutes/responseRate"
  - "scripts/clean-test-fixtures.ts + npm run clean:test-fixtures"
  - "Clean (mu3-fixture-free) dev database"
affects: [06-02, 06-03, 06-04, 06-05, 06-06, 06-07, 07-design-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sixth occurrence of the Prisma migrate-dev DROP INDEX/DROP DEFAULT trap on Business.location/searchable — strip before applying, documented in migration header comment"
    - "One-time DB-hygiene scripts live in scripts/, never imported by prisma/seed.ts, follow the same main().catch().finally() shape as seed.ts"

key-files:
  created:
    - prisma/migrations/20260925054058_add_data_foundation_fields/migration.sql
    - scripts/clean-test-fixtures.ts
  modified:
    - prisma/schema.prisma
    - lib/validation/business.schema.ts
    - package.json

key-decisions:
  - "BusinessPhoto.tag and ReviewPhoto.tag are both nullable (PhotoTag?) at the DB level — BusinessPhoto.tag is expected to be populated for every seeded photo by 06-07 as an application-level guarantee, not a NOT NULL constraint, matching the plan's literal `tag PhotoTag?` type spec"
  - "isTest deliberately excluded from businessSeedSchema — real businesses.json rows should never set it; Prisma's @default(false) already covers every business created through the seed path"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-07, DATA-09]

coverage:
  - id: D1
    description: "Business/Review/User rows can each be marked isTest; new Prisma Client fields compile across the codebase"
    requirement: "DATA-01"
    verification:
      - kind: unit
        ref: "npx prisma validate && npx prisma migrate status (manual command invocation)"
        status: pass
      - kind: unit
        ref: "npx tsc --noEmit against prisma.business.create/prisma.user.create/prisma.businessPhoto.create with new fields (scratch file, deleted after)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The two known mu3-suffixed test fixtures (Owner Edit Cafe businesses, walk-ins on Sundays Q&A) no longer exist in the database and the cleanup script is idempotent"
    requirement: "DATA-03"
    verification:
      - kind: other
        ref: "npm run clean:test-fixtures (first run: cleaned 2 businesses + 5 questions; second run: cleaned 0/0)"
        status: pass
    human_judgment: false
  - id: D3
    description: "businessSeedSchema still validates all 107 existing businesses.json rows and accepts the three new optional fields"
    requirement: "DATA-01"
    verification:
      - kind: unit
        ref: "npx tsx -e businessSeedSchema.safeParse over all 107 businesses.json rows (manual command invocation)"
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-09-25
status: complete
---

# Phase 6 Plan 1: Data Foundation Schema Migration Summary

**Single migration adding Business.guaranteed/responseTimeMinutes/responseRate/isTest, User elite/profile/counter fields, Review.isTest, and the PhotoTag enum, plus a one-time cleanup script that removed 2 "Owner Edit Cafe" businesses and 5 "walk-ins on Sundays" questions from the dev database.**

## Performance

- **Duration:** ~12 min (excluding local Docker Desktop cold-start wait)
- **Started:** 2026-09-25T05:38:00Z (approx, session start)
- **Completed:** 2026-09-25T05:45:54Z
- **Tasks:** 3
- **Files modified:** 4 (1 created migration file, 1 created script, 2 modified: schema.prisma, business.schema.ts, package.json — 3 modified total)

## Accomplishments
- Added every Phase 6 schema field/enum (Business.guaranteed/responseTimeMinutes/responseRate/isTest, User.eliteYear/avatarUrl/city/friendCount/reviewCount/photoCount/isTest, Review.isTest, PhotoTag enum, BusinessPhoto.tag, ReviewPhoto.tag) in one migration, applied cleanly against local Postgres
- Stripped the sixth occurrence of this project's documented Prisma DROP INDEX/DROP DEFAULT migrate-dev trap (Business_location_gist, business_name_trgm_idx, searchable DROP DEFAULT)
- Extended businessSeedSchema with three new optional Business content fields; confirmed all 107 existing businesses.json rows still validate unchanged
- Built and ran scripts/clean-test-fixtures.ts, which found and removed the real mu3-pattern fixtures (2 "Owner Edit Cafe " businesses, 5 "Do they take walk-ins on Sundays " questions) via Prisma query-builder filters only, then confirmed idempotency on a second run

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate schema — all Phase 6 fields and the PhotoTag enum in one pass** - `21bef8f` (feat)
2. **Task 2: Extend businessSeedSchema for the three new optional Business content fields** - `cbcbeea` (feat)
3. **Task 3: One-time cleanup of known mu3-suffixed test fixtures** - `95a4a02` (feat)

_No TDD tasks in this plan; single commit per task._

## Files Created/Modified
- `prisma/schema.prisma` - Added Business.guaranteed/responseTimeMinutes/responseRate/isTest, User.eliteYear/avatarUrl/city/friendCount/reviewCount/photoCount/isTest, Review.isTest, PhotoTag enum, BusinessPhoto.tag, ReviewPhoto.tag
- `prisma/migrations/20260925054058_add_data_foundation_fields/migration.sql` - Hand-stripped migration (removed auto-generated DROP INDEX x2 + DROP DEFAULT, sixth documented occurrence)
- `lib/validation/business.schema.ts` - Added guaranteed/responseTimeMinutes/responseRate as optional keys to businessSeedSchema
- `scripts/clean-test-fixtures.ts` - New standalone dev-run script; Prisma query-builder deletes only, 20-row safety guard, idempotent
- `package.json` - Added `clean:test-fixtures` npm script after `test:e2e`

## Decisions Made
- Kept BusinessPhoto.tag/ReviewPhoto.tag as nullable `PhotoTag?` at the DB level exactly as the plan specified the type, even though the plan's prose called BusinessPhoto.tag "required" — that's an application-level guarantee 06-07 fulfills by seeding every photo, not a schema-level NOT NULL constraint
- Excluded isTest from businessSeedSchema entirely (not just left unset) since real seed data should never be able to set it — Prisma's `@default(false)` covers every business created through the seed path

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reworded a script comment to avoid tripping its own acceptance-criteria grep**
- **Found during:** Task 3 verification
- **Issue:** The initial comment in `scripts/clean-test-fixtures.ts` explaining the no-raw-SQL design literally contained the string `$queryRaw`, so `grep -c '\$queryRaw\|\$executeRaw' scripts/clean-test-fixtures.ts` returned 1 instead of the required 0 (unlike the migration-file check, this acceptance criterion has no carve-out for comment mentions).
- **Fix:** Reworded the comment to describe the guarantee without naming the literal method (`"never a raw-SQL escape hatch with string interpolation"`).
- **Files modified:** scripts/clean-test-fixtures.ts
- **Verification:** `grep -c '\$queryRaw\|\$executeRaw' scripts/clean-test-fixtures.ts` now returns 0; re-ran `npm run clean:test-fixtures` to confirm behavior unchanged.
- **Committed in:** `95a4a02` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix, Rule 1)
**Impact on plan:** Cosmetic-only fix to satisfy the plan's own literal acceptance criterion. No scope creep.

## Issues Encountered
- Local Docker Desktop was not running at session start; started it (`open -a Docker`), waited for the daemon, then `docker compose up -d` to bring up the local Postgres+PostGIS container before any Prisma command could run.
- The first `npx prisma migrate dev` invocation (no flags) applied the pending migration successfully but then hung on an interactive "Enter a name for the new migration" prompt (Prisma re-diffing after apply, likely due to the `location`/`searchable` raw-DDL columns Prisma can't fully represent). Killed the stuck process and confirmed via `npx prisma migrate status` that the migration had already applied cleanly and the schema was up to date — no further action needed.

## User Setup Required

None - no external service configuration required. (Local Docker Postgres was already provisioned from a prior phase; only needed to be started for this session.)

## Next Phase Readiness
- `lib/generated/prisma` now exposes every new field/enum this phase needs; 06-02 through 06-07 can build against real Prisma Client types instead of `any`
- businessSeedSchema accepts the three new optional Business fields without breaking any of the 107 existing rows
- Dev database is mu3-fixture-free as of this run; note that `e2e/leftovers.spec.ts`/`e2e/photos-qa-collections.spec.ts` will keep creating new matching rows on every e2e run — `npm run clean:test-fixtures` can be re-run any time to clean up again (out of scope for this plan to prevent at the source)
- No blockers for 06-02

---
*Phase: 06-data-foundation*
*Completed: 2026-09-25*

## Self-Check: PASSED

All created/modified files confirmed on disk (prisma/schema.prisma, prisma/migrations/20260925054058_add_data_foundation_fields/migration.sql, lib/validation/business.schema.ts, scripts/clean-test-fixtures.ts, package.json, this SUMMARY.md). All four commits (21bef8f, cbcbeea, 95a4a02, ebdcee0) confirmed present in `git log`.
