# Deferred Items — Phase 3 (Reviews & Ratings)

Pre-existing issues discovered during 03-backend execution but out of scope
for this chunk (SCOPE BOUNDARY rule — only auto-fix issues directly caused
by this chunk's own changes).

## Pre-existing: time-of-day-flaky open-now integration tests

- **File:** `lib/search/run-search-query.test.ts`
- **Tests:** `runSearchQuery — open-now application-layer post-filter (SRCH-03,
  Task 3) > includes an overnight shift still active now and excludes a
  shift that already ended today`, and the adjacent `totalCount/totalPages`
  test.
- **Found during:** 03-backend `npx vitest run` full-suite pass.
- **Root cause:** these fixtures use a real-clock overnight shift
  (`18:00`-`09:00`, `crossesMidnight: true`) with "multi-hour safety
  margins" (per STATE.md's 02-02 decision log), but that margin doesn't
  cover the daytime window between the shift's `09:00` close and its next
  `18:00` open — running the suite at, e.g., 10:55 Asia/Colombo makes the
  fixture genuinely closed, not open, so the assertion fails. Not caused by
  any Phase 3 change (git blame: last touched in commit `f0af271`, Phase 2).
- **Status:** Not fixed — logged only, per SCOPE BOUNDARY. A real fix needs
  either an explicit `now` override threaded through the test (the
  underlying `computeOpenNow` already supports one, per its own
  `.test.ts`) or fixtures redesigned to be open across the full 24h test
  window.
