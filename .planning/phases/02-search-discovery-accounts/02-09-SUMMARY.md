---
phase: 02-search-discovery-accounts
plan: 09
subsystem: testing
tags: [playwright, e2e, regression, otp, router-cache]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (plans 01-08)
    provides: "Every Phase 2 surface this plan exercises end to end: / (02-07), /search + filters (02-04/02-08), /business/[slug] (Phase 1, unchanged), /login + OTP send/verify (02-03/02-05), session-aware header (02-06)"
provides:
  - "e2e/guest-browsing.spec.ts — permanent AUTH-02/D-05 zero-redirect regression net across every Phase 2 guest-facing page"
  - "e2e/search-and-auth-flow.spec.ts — one continuous smoke path proving home -> search -> filter -> business page -> OTP login -> logged-in header composes correctly"
  - "app/login/page.tsx router.refresh() fix — post-login header now actually updates"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "router.push(url) followed by router.refresh() when a client action (fetch-issued session cookie) needs a Server Component ancestor (app/layout.tsx) to re-read state that Next's client Router Cache would otherwise keep stale on a already-visited route"

key-files:
  created:
    - e2e/guest-browsing.spec.ts
    - e2e/search-and-auth-flow.spec.ts
  modified:
    - app/login/page.tsx

key-decisions:
  - "guest-browsing.spec.ts uses one test with a single fresh Playwright page navigating all 5 URLs in turn (matching the plan's literal 'a fresh Playwright context visiting, in turn' wording) rather than 5 independent test() blocks"
  - "search-and-auth-flow.spec.ts filters 'cafe' free-text results down via the 'Cafes & Bakeries' category checkbox (9 -> 6 results against the real seeded data) instead of a filter that could zero out the result set, since the next step needs a result card to click into"
  - "Test phone number is generated fresh per run (Date.now()-suffixed) rather than a fixed constant, since a fixed phone would hit an already-signed-up User on re-run (hasSeenProfilePrompt already true), silently skipping the exact profile-dialog-dismiss -> logged-in-header step this test exists to prove"

requirements-completed: [AUTH-02]

coverage:
  - id: D1
    description: "e2e/guest-browsing.spec.ts visits /, /search, /search?find_desc=cafe, /business/{known-slug}, and /login in one fresh context; asserts zero redirects, real page-appropriate content renders (not an auth-wall placeholder), and the header's guest 'Log in' CTA (never an avatar/dropdown) stays visible throughout"
    requirement: "AUTH-02"
    verification:
      - kind: e2e
        ref: "npx playwright test e2e/guest-browsing.spec.ts (1/1 pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "e2e/search-and-auth-flow.spec.ts covers, in one continuous flow: home search-bar submit -> /search with a visible ranked result -> category-filter narrows the result set -> business page renders (name heading, hours badge, attribute badge) -> /login via header CTA -> OTP send/devCode/verify -> Skip for now on the progressive-profile dialog -> header shows the logged-in avatar/dropdown ('Account') instead of 'Log in'"
    requirement: "(cross-cutting, AUTH-01/AUTH-03/SRCH-01..04 composed)"
    verification:
      - kind: e2e
        ref: "npx playwright test e2e/search-and-auth-flow.spec.ts (1/1 pass)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Full suite stays green: no regressions to Phase 1's directory-to-business.spec.ts or any of Phase 2's 137 vitest unit/component/integration tests"
    verification:
      - kind: other
        ref: "npx vitest run (137/137 pass); npx playwright test (3/3 pass, all specs together); npx tsc --noEmit (clean); npm run build (Next.js 16.3.5 Turbopack production build succeeds, all 12 routes compile)"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 09: Guest-Browsing Regression Net & Cross-Cutting Smoke Test Summary

**Closes out Phase 2 with the two locked Playwright e2e specs 02-VALIDATION.md's Wave 0 requires — a permanent zero-redirect guest-browsing regression net (AUTH-02/D-05) and one continuous smoke path proving search, filters, the business page, and phone-OTP login all compose correctly — and the flow itself caught a real post-login header staleness bug, fixed inline.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-15T07:18:38+05:30 (immediately following 02-08)
- **Completed:** 2026-09-15T07:26:36+05:30
- **Tasks:** 2
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments

- `e2e/guest-browsing.spec.ts` — one fresh, cookie-less Playwright context visits `/`, `/search`, `/search?find_desc=cafe`, `/business/ministry-of-crab`, and `/login` in turn, asserting zero redirects, real page-appropriate content (hero heading / result card or empty-state heading / business name heading / phone-entry heading), and the header's guest "Log in" CTA visible on every one of them — the permanent, automated regression net for D-05/AUTH-02 this plan's threat model calls the single most important thing to catch
- `e2e/search-and-auth-flow.spec.ts` — one continuous flow against the real local Postgres-backed dev server: home search-bar submit -> `/search?find_desc=cafe` with a visible ranked card -> "Cafes & Bakeries" category filter narrows 9 results to 6 -> clicking into a result renders its business page (name heading, Open now/Closed badge, attribute badge, reusing Phase 1's proven assertions) -> header's "Log in" CTA -> phone entry -> reads `devCode` from the intercepted `/api/auth/otp/send` response (dev-mode transport, D-03, no real SMS provider) -> enters the code -> dismisses the progressive-profile dialog via "Skip for now" -> header now shows the logged-in avatar/dropdown ("Account") instead of "Log in"
- While building the second spec, the flow caught a real bug: `app/login/page.tsx`'s post-login `router.push("/")` reused Next.js's client-side Router Cache for the already-visited `/` route, so `app/layout.tsx`'s session-aware header kept rendering the stale guest "Log in" CTA even after a successful login and session-cookie issuance. Fixed by adding `router.refresh()` after both the direct-login and skip-profile-dialog redirect paths — this is exactly the kind of whole-phase composition bug this final plan exists to surface.
- Full suite verified green together: `npx vitest run` (137/137), `npx playwright test` (3/3, including Phase 1's unmodified `directory-to-business.spec.ts`), `npx tsc --noEmit` (clean), `npm run build` (all 12 routes compile).

## Task Commits

Each task was committed atomically:

1. **Task 1: Guest-browsing zero-redirect regression test** - `44fed45` (test)
2. **Task 2: Full search + auth cross-cutting smoke path** - `80156b4` (test, includes the `router.refresh()` bugfix)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `e2e/guest-browsing.spec.ts` - one-test, 5-URL guest-browsing regression spec
- `e2e/search-and-auth-flow.spec.ts` - one-test, full-phase cross-cutting smoke spec
- `app/login/page.tsx` - added `router.refresh()` after both post-login redirect paths (Rule 1 bugfix)

## Decisions Made

- `guest-browsing.spec.ts` is written as a single `test()` with one fresh `page` visiting all 5 URLs in turn (matching the plan's literal "a fresh ... Playwright context visiting, in turn" wording) rather than 5 independent `test()` blocks that would each get their own isolated context — a single sequential flow was what the plan's action text specified.
- `search-and-auth-flow.spec.ts`'s filter step uses the "Cafes & Bakeries" category checkbox against the `find_desc=cafe` result set (verified via `curl` against the real seeded dataset: 9 results narrow to 6, never to 0) rather than an arbitrary filter, since the next step in the flow needs a result card to click into — a filter that could zero out the result set would break the rest of the chain.
- The test phone number is generated fresh each run (`+9477` + a `Date.now()`-derived suffix) instead of a fixed constant, since a fixed phone number would hit an already-signed-up `User` row on a second run (`hasSeenProfilePrompt` already persisted `true` from the first run's "Skip for now"), silently skipping straight past the progressive-profile-dialog step this test specifically exists to exercise.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Header stayed on the guest "Log in" CTA after a successful login**
- **Found during:** Task 2, writing `search-and-auth-flow.spec.ts`'s final assertion (header shows the logged-in avatar/dropdown)
- **Issue:** `app/login/page.tsx`'s `handleVerified`/`handleProfileDismiss` both called only `router.push("/")` after a successful OTP verify (and, respectively, after the profile dialog's Save/Skip). The session cookie is issued via a `fetch()` call (`/api/auth/otp/verify`, `/api/auth/profile`), not a full page navigation, so Next.js's client-side Router Cache still held the pre-login RSC payload for the already-visited `/` route (from the test's initial `page.goto("/")`). `app/layout.tsx` — a pure async Server Component that reads `getSession()`/`prisma.user` on every real server render — never got a chance to re-run, so the header kept showing "Log in" instead of the avatar/dropdown, contradicting this plan's own must-have truth that the flow proves "logged-in header state."
- **Fix:** Added `router.refresh()` immediately after `router.push("/")` in both `handleVerified` (direct-to-home path, when `hasSeenProfilePrompt` is already `true`) and `handleProfileDismiss` (the Save/Skip path), forcing Next.js to re-fetch the Server Component tree — including the header — with the just-issued session cookie.
- **Files modified:** `app/login/page.tsx`
- **Verification:** `npx playwright test e2e/search-and-auth-flow.spec.ts` — the final assertion (`getByRole("button", { name: "Account" })` visible, zero `"Log in"` links) now passes; re-ran 2x with fresh phone numbers each time, no flake.
- **Committed in:** `80156b4` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug)
**Impact on plan:** This is the single production-code change this plan made, and it's exactly the class of bug this final plan's threat model (T-02-09) exists to catch — a whole-phase composition failure invisible to any single vertical-slice plan's own unit/component tests, since 02-05's OTP forms and 02-06's session-aware header were each individually correct in isolation. No architectural change; no scope creep beyond the one file the bug lived in.

## Issues Encountered

None beyond the router-cache bug documented above. The `getByText(/^\d+ results/)` locator needed `.first()` — the results-count paragraph is rendered twice (one `md:hidden` mobile variant, one desktop variant) for responsive layout, both present in the DOM simultaneously; a Playwright strict-mode violation on the first attempt, fixed by scoping to `.first()`.

## User Setup Required

None — no external service configuration required. Uses the same local Docker Postgres+PostGIS instance and 107-business seeded dataset already running from Phase 1/02-01, plus the dev-mode OTP transport (D-03, no real SMS provider needed).

## Next Phase Readiness

- Phase 2 (Search, Discovery & Accounts) is now fully closed out: all 9 plans complete, both locked Wave-0 e2e specs green, full suite (137 vitest + 3 Playwright) green with zero regressions to Phase 1
- `e2e/guest-browsing.spec.ts` runs as part of this project's standard `npx playwright test` command going forward — any future phase that accidentally introduces a guest-facing auth gate on `/`, `/search`, `/business/[slug]`, or `/login` fails this spec immediately
- No blockers for Phase 3.

## Self-Check: PASSED

Both created files (`e2e/guest-browsing.spec.ts`, `e2e/search-and-auth-flow.spec.ts`) confirmed
present on disk. Both task commits (`44fed45`, `80156b4`) confirmed present in `git log`. Full
suite verified green in this session: `npx vitest run` (137/137), `npx playwright test` (3/3, all
specs together including Phase 1's unmodified `directory-to-business.spec.ts`), `npx tsc --noEmit`
(clean), `npm run build` (Next.js 16.3.5 Turbopack production build succeeds, all 12 routes
compile).

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
