# Deferred Items — Phase 6 Data Foundation

Issues discovered during execution that are out of scope for the current plan's task
(pre-existing, not caused by the task's changes). Logged per the executor's Scope
Boundary rule rather than fixed inline.

## 06-02

- **File:** `lib/search/run-search-query.test.ts`
- **Tests:** `runSearchQuery — open-now application-layer post-filter (SRCH-03, Task 3)` >
  "includes an overnight shift still active now and excludes a shift that already ended
  today" and "recomputes totalCount/totalPages against the post-filter (open-only) count,
  not the pre-filter SQL count"
- **Issue:** The `beforeAll` open-now fixture setup hardcodes `openOvernightId`'s shift as
  `18:00` (yesterday) through `09:00` (today, `crossesMidnight: true`) with a comment
  claiming a "multi-hour safety margin either side of now" — but this margin only holds if
  the suite runs before ~09:00 Asia/Colombo. Running the suite after 09:00 Colombo time
  (as in this execution, ~11:20 Colombo) makes the "open overnight" fixture legitimately
  closed, failing both assertions. This is a pre-existing time-of-day flakiness in the test
  fixture design (02-02, per STATE.md's decision log), not something introduced by 06-02's
  isTest-filtering changes — 06-02 only adds insertions elsewhere in the same file and does
  not touch this `beforeAll` block or `filterOpenNow`.
- **Fix (not applied here, out of scope):** anchor both fixtures' `dayOfWeek`/`openTime`/
  `closeTime` relative to the real "now" Colombo hour at fixture-creation time (e.g. now-1h
  to now+1h for the open fixture, now-3h to now-1h for the closed fixture) instead of the
  fixed 18:00-09:00 / 00:00-03:00 windows, so the suite is time-of-day-independent.
