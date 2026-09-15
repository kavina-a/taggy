---
phase: 02-search-discovery-accounts
plan: 05
subsystem: auth-ui
tags: [react-hook-form, zod, input-otp, shadcn-dialog, nextjs-route-handlers, vitest, testing-library]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (Plan 01)
    provides: "lib/otp/otp.schema.ts (sendOtpSchema/verifyOtpSchema), shadcn input/label/input-otp/dialog/form primitives"
  - phase: 02-search-discovery-accounts (Plan 03)
    provides: "POST /api/auth/otp/send, POST /api/auth/otp/verify, getSession() sealed httpOnly cookie helper"
provides:
  - "GET /login — two-step client flow (phone entry -> OTP entry) composing PhoneEntryForm/OtpEntryForm"
  - "PhoneEntryForm / OtpEntryForm — react-hook-form + zodResolver forms wired to the OTP send/verify endpoints"
  - "ProgressiveProfileDialog — non-blocking 'what should we call you' prompt, shown exactly once"
  - "POST /api/auth/profile — persists name + hasSeenProfilePrompt for the session's own user"
affects: [02-06-header-auth-state]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "react-hook-form + @hookform/resolvers/zodResolver wired directly to the existing sendOtpSchema/verifyOtpSchema .strict() schemas — no parallel client-only validation schema"
    - "OtpEntryForm owns its own resend-cooldown timer and re-calls /api/auth/otp/send directly, rather than delegating resend to a parent callback"
    - "ProgressiveProfileDialog's Save and Skip both route through the exact same POST /api/auth/profile call (Save sends the trimmed name, Skip sends null) so hasSeenProfilePrompt is always set server-side regardless of path"

key-files:
  created:
    - components/auth/phone-entry-form.tsx
    - components/auth/phone-entry-form.test.tsx
    - components/auth/otp-entry-form.tsx
    - components/auth/otp-entry-form.test.tsx
    - app/login/page.tsx
    - components/auth/progressive-profile-dialog.tsx
    - components/auth/progressive-profile-dialog.test.tsx
    - app/api/auth/profile/route.ts
  modified: []

key-decisions:
  - "OtpEntryForm calls POST /api/auth/otp/send directly for both the initial send (via PhoneEntryForm) and every resend, rather than threading a resend callback prop through app/login/page.tsx — keeps the 30s cooldown timer and dev-code refresh logic self-contained in one component"
  - "ProgressiveProfileDialog's 'Skip for now' is rendered as an <a href=\"#\"> with preventDefault (not a button styled as a link) so it exposes an accessible role=\"link\", matching UI-SPEC's 'text link, equal visual weight' framing (D-06) precisely"

requirements-completed: [AUTH-01, AUTH-03]

coverage:
  - id: D1
    description: "PhoneEntryForm blocks an empty-phone submit client-side (zodResolver) before ever calling fetch; on a successful send it calls onSent(phone, devCode) with devCode passed through as-is (undefined when the response omits it)"
    requirement: "AUTH-01"
    verification:
      - kind: unit
        ref: "components/auth/phone-entry-form.test.tsx (3/3 tests pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "OtpEntryForm shows the (dev mode) caption only when devCode is present, disables Verify until exactly 6 digits are entered, shows the exact wrong-code copy inline on a 400 without navigating away, calls onVerified(user) on success, and the Resend link is disabled with a 0:30 countdown that re-enables after 30s"
    requirement: "AUTH-01"
    verification:
      - kind: unit
        ref: "components/auth/otp-entry-form.test.tsx (5/5 tests pass)"
        status: pass
    human_judgment: false
  - id: D3
    description: "ProgressiveProfileDialog renders with Save and Skip for now both enabled immediately, Save posts the trimmed name then dismisses, Skip posts null then dismisses, both routes go through the same /api/auth/profile call, and the dialog never navigates the URL"
    requirement: "AUTH-03"
    verification:
      - kind: unit
        ref: "components/auth/progressive-profile-dialog.test.tsx (4/4 tests pass)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The full phone -> dev-mode code -> verify -> name-prompt round trip works end-to-end against the running dev server and a real local Postgres instance: send returns a devCode, a wrong code returns the exact UI-SPEC copy, a correct code sets a sealed httpOnly session cookie and returns hasSeenProfilePrompt:false for a first-time user, /api/auth/profile rejects an unauthenticated caller with 401, and an authenticated Save persists name + hasSeenProfilePrompt:true (confirmed by re-verifying the same phone and observing the updated user object)"
    requirement: "AUTH-01, AUTH-03"
    verification:
      - kind: other
        ref: "npm run build (Next.js 16.3.5 Turbopack production build — /login static, /api/auth/profile registered as a dynamic route, compiles cleanly); npx tsc --noEmit (exit 0); manual curl walk-through against npm run dev + local Postgres (send -> wrong-code 400 -> correct-code 200 + Set-Cookie -> unauthenticated profile 401 -> authenticated profile Save 200 -> re-verify shows name+hasSeenProfilePrompt persisted)"
        status: pass
    human_judgment: false

# Metrics
duration: 10min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 05: Phone-OTP Login UI & Progressive Profile Summary

**Two-step `/login` client flow (phone entry -> OTP entry, react-hook-form + zodResolver against the existing OTP schemas) wired to 02-03's send/verify endpoints, plus a non-blocking post-verification "what should we call you" dialog that persists via a single shared `/api/auth/profile` endpoint so it can never reappear once dismissed.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-09-15T06:24:46+05:30
- **Completed:** 2026-09-15T06:31:00+05:30
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- `PhoneEntryForm` — `react-hook-form` + `zodResolver(sendOtpSchema)`, blocks empty submits client-side, calls `POST /api/auth/otp/send`, advances via `onSent(phone, devCode?)`
- `OtpEntryForm` — shadcn `input-otp` (3+3 grouped, `autocomplete="one-time-code"`), Verify disabled until 6 digits, exact wrong-code copy on a 400 (`"That code didn't work. Check it and try again."`), dev-mode caption gated strictly on the `devCode` prop's presence, self-contained 30-second resend cooldown that re-calls the send endpoint
- `app/login/page.tsx` — client-rendered two-step composition; on verify, routes to the progressive-profile dialog when `hasSeenProfilePrompt` is `false`, otherwise `router.push("/")`; never auto-redirected into from elsewhere (D-05)
- `ProgressiveProfileDialog` — shadcn `dialog`, non-blocking, "Save" and "Skip for now" both enabled immediately and both persist through the exact same `/api/auth/profile` call (Save sends the trimmed name, Skip sends `null`) so `hasSeenProfilePrompt` is always set regardless of path
- `POST /api/auth/profile` — reads `userId` exclusively from the sealed session cookie (401 if absent), validates `{ name }` via a `.strict()` Zod schema, updates only the calling user's own row (T-02-12)

## Task Commits

Each task was committed atomically:

1. **Task 1: Phone entry + OTP entry two-step login flow** - `dbfe4b7` (test, RED) → `89997a3` (feat, GREEN)
2. **Task 2: Progressive-profile dialog and profile-save endpoint** - `5a9e6b4` (test, RED) → `667c25e` (feat, GREEN)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `components/auth/phone-entry-form.tsx` - `PhoneEntryForm`
- `components/auth/phone-entry-form.test.tsx` - 3 behavior tests
- `components/auth/otp-entry-form.tsx` - `OtpEntryForm`
- `components/auth/otp-entry-form.test.tsx` - 5 behavior tests
- `app/login/page.tsx` - `GET /login`
- `components/auth/progressive-profile-dialog.tsx` - `ProgressiveProfileDialog`
- `components/auth/progressive-profile-dialog.test.tsx` - 4 behavior tests
- `app/api/auth/profile/route.ts` - `POST /api/auth/profile`

## Decisions Made

- `OtpEntryForm` owns its resend logic directly (calls `/api/auth/otp/send` itself and manages its own cooldown state) instead of threading a resend callback down from `app/login/page.tsx` — keeps the timer/dev-code-refresh concern in one place.
- `ProgressiveProfileDialog`'s "Skip for now" renders as an `<a href="#">` with `preventDefault()` (accessible `role="link"`), matching UI-SPEC's "text link, equal visual weight" description literally rather than a button styled to look like a link.

## Deviations from Plan

None - plan executed exactly as written. Both tasks' test files (`phone-entry-form.test.tsx`, `otp-entry-form.test.tsx`) were added even though only referenced implicitly via the plan's `<verify>` automated command (not individually named in the frontmatter's `files_modified`) — this is the expected TDD RED/GREEN artifact, not a scope deviation.

## Issues Encountered

Two initial test-fixture bugs were caught and fixed during the RED->GREEN cycle for `otp-entry-form.test.tsx` before it was committed as GREEN:
- The dev-mode-caption test's phone number (`+94771234567`) accidentally contained the same digit substring as its `devCode` (`123456`), causing a "multiple elements match" false failure — fixed by using non-overlapping fixture values (`+94771112222` / `998877`).
- The resend-cooldown test's `vi.advanceTimersByTime(30_000)` call needed to be wrapped in `@testing-library/react`'s `act()` for the interval-driven state update to flush before the assertion — fixed by wrapping the timer advance.

Neither required touching the implementation; both were test-file-only corrections, tracked here for transparency rather than as a Rule 1-3 deviation against the implementation.

## User Setup Required

None - no external service configuration required. All dependencies (`react-hook-form`, `@hookform/resolvers`, `input-otp`, the shadcn `dialog`/`form`/`input-otp` primitives) were already installed by 02-01/02-03.

## Next Phase Readiness

- `/login`'s two-step flow and the progressive-profile dialog are fully wired end-to-end against 02-03's real send/verify/session backend and a real local Postgres instance (confirmed via manual curl walk-through: send -> wrong-code 400 -> correct-code 200 with `Set-Cookie` -> unauthenticated profile 401 -> authenticated Save 200 -> re-verify shows the persisted name and `hasSeenProfilePrompt: true`)
- 02-06 (header auth state) can now wire a "Log in" CTA that routes to `/login`, and read the session for logged-in/guest header state
- `e2e/search-and-auth-flow.spec.ts` (02-VALIDATION.md's cross-cutting smoke path) remains deferred until 02-06 gives the flow an entry point in the header — there is still no in-app link to `/login` yet, only the manual/direct-URL walk-through confirmed here
- No blockers

## Self-Check: PASSED

All 8 created files (`components/auth/phone-entry-form.tsx`, `components/auth/phone-entry-form.test.tsx`,
`components/auth/otp-entry-form.tsx`, `components/auth/otp-entry-form.test.tsx`, `app/login/page.tsx`,
`components/auth/progressive-profile-dialog.tsx`, `components/auth/progressive-profile-dialog.test.tsx`,
`app/api/auth/profile/route.ts`) confirmed present on disk. All 4 task commits (`dbfe4b7`, `89997a3`,
`5a9e6b4`, `667c25e`) confirmed present in `git log`. Full test suite (112/112) and `npx tsc --noEmit`
and `npm run build` all pass clean.

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
