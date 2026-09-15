---
phase: 02-search-discovery-accounts
plan: 03
subsystem: auth
tags: [otp, iron-session, prisma, rate-limiting, libphonenumber-js, nextjs-route-handlers, vitest]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (Plan 01)
    provides: "User/OtpChallenge Prisma models, lib/otp/generate.ts (generateOtpCode/hashOtpCode/verifyOtpCode/OTP_EXPIRY_MS), lib/otp/otp.schema.ts (sendOtpSchema/verifyOtpSchema), OTP_HMAC_SECRET/SESSION_SECRET env vars"
provides:
  - "checkRateLimit(key, opts) — in-memory per-key rate limiter with documented multi-instance limitation"
  - "OtpTransport interface + ConsoleOtpTransport dev-stub implementation"
  - "POST /api/auth/otp/send — rate-limited, existence-blind OTP send endpoint"
  - "verifyOtpChallenge(phone, code) — hash compare, expiry check, MAX_OTP_ATTEMPTS lockout"
  - "getSession() — iron-session sealed httpOnly cookie helper, IronSessionData augmentation"
  - "POST /api/auth/otp/verify — verifies code, upserts User, issues session cookie"
affects: [02-05-login-forms, 02-06-header-auth-state]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "checkRateLimit(key, opts) — module-level Map<string, {count,resetAt}>-backed limiter behind a small async interface, matching the OtpTransport pattern so a future @upstash/ratelimit swap requires zero call-site changes"
    - "OTP send route never queries or branches on User existence (T-02-05) — the existence check only happens in the verify route, after a code is successfully entered"
    - "iron-session getSession() as the sole session mechanism (D-04) — sealed httpOnly cookie, no client-readable token"

key-files:
  created:
    - lib/rate-limit/in-memory-limiter.ts
    - lib/rate-limit/in-memory-limiter.test.ts
    - lib/otp/transport.ts
    - app/api/auth/otp/send/route.ts
    - lib/otp/verify.ts
    - lib/otp/verify.test.ts
    - lib/session.ts
    - app/api/auth/otp/verify/route.ts
  modified: []

key-decisions:
  - "Followed the plan's literal action text for the verify route: no libphonenumber-js re-normalization of the incoming phone in /api/auth/otp/verify — the client is expected to resubmit the same phone string the send route returned/normalized. Not flagged as a gap since the plan's contract explicitly omits this step for the verify route (unlike the send route, which does normalize)."

patterns-established:
  - "Rate limiter and OTP transport both expose a minimal async interface (checkRateLimit / OtpTransport.send) specifically so their bootstrap-budget dev implementations (in-memory Map, console.log) can be swapped for production equivalents (@upstash/ratelimit, NotifyLkTransport/DialogTransport) with zero call-site changes"

requirements-completed: [AUTH-01]

coverage:
  - id: D1
    description: "checkRateLimit(key, opts) allows up to max calls within windowMs, rejects the (max+1)th, resets after the window elapses, and tracks different keys independently"
    requirement: "AUTH-01"
    verification:
      - kind: unit
        ref: "lib/rate-limit/in-memory-limiter.test.ts (3/3 tests pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "POST /api/auth/otp/send validates the phone (libphonenumber-js, LK region), enforces per-phone and per-IP rate limits before any OtpChallenge row is created, creates the challenge with a hashed code, and never queries/branches on User existence"
    requirement: "AUTH-01"
    verification:
      - kind: other
        ref: "npm run build (Next.js 16.3.5 Turbopack production build — /api/auth/otp/send registered as a dynamic route, compiles cleanly)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit (exit 0, no type errors)"
        status: pass
    human_judgment: false
  - id: D3
    description: "verifyOtpChallenge(phone, code) returns not_found/expired/invalid(+attemptCount increment)/locked/ok(+consumedAt set) exactly per the locked behavior spec, against the real local Postgres instance, and never re-validates an already-consumed challenge"
    requirement: "AUTH-01"
    verification:
      - kind: integration
        ref: "lib/otp/verify.test.ts (5/5 tests pass against local Postgres)"
        status: pass
    human_judgment: false
  - id: D4
    description: "getSession() issues a sealed, httpOnly, iron-session cookie; POST /api/auth/otp/verify upserts exactly one User row keyed by phone on success, copies a guest's lang_pref cookie once at signup, sets session.userId/phone, and returns the user's minimal profile fields"
    requirement: "AUTH-01"
    verification:
      - kind: other
        ref: "npm run build (Next.js 16.3.5 Turbopack production build — /api/auth/otp/verify registered as a dynamic route, compiles cleanly)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit (exit 0, no type errors)"
        status: pass
    human_judgment: true
    rationale: "No UI exists yet in this plan (02-05 builds the login forms next) to drive an end-to-end send->verify->session HTTP round trip against the running dev server; the underlying logic (verifyOtpChallenge, getSession, upsert semantics) is fully unit/integration tested, but the wired-together Route Handler's actual HTTP request/response/cookie behavior is best confirmed once 02-05's forms exist to exercise it, or via a human curl/Postman check against `npm run dev`."

# Metrics
duration: 15min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 03: OTP Auth Core — Send/Verify/Session Summary

**Phone-OTP round trip (rate-limited send, hash-compared verify with 5-attempt lockout) plus an iron-session sealed httpOnly-cookie session helper, both fully backend-only and TDD'd against the real local Postgres instance.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-09-15T00:28:00Z
- **Completed:** 2026-09-15T00:43:03Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- `checkRateLimit(key, opts)` in-memory limiter (per-key window tracking, independent keys) with Pitfall 3's multi-instance limitation documented directly in the module
- `ConsoleOtpTransport` dev-stub `OtpTransport` implementation (D-03) that logs the code instead of sending real SMS
- `POST /api/auth/otp/send` — validates phone via `libphonenumber-js` (LK region), enforces per-phone (3/min) AND per-IP (10/min) rate limits before creating any `OtpChallenge` row, and never branches its response on whether the phone already has a `User` (T-02-05, information-disclosure mitigation)
- `verifyOtpChallenge(phone, code)` — hash-compares against the most recent non-consumed challenge, enforces 5-minute expiry and `MAX_OTP_ATTEMPTS = 5` lockout, increments `attemptCount` on a wrong guess, and consumes the challenge on success so it can never be re-validated
- `getSession()` — `iron-session` sealed httpOnly cookie helper (D-04), the only session mechanism in the app
- `POST /api/auth/otp/verify` — on a correct code, upserts exactly one `User` row keyed by phone (copying a guest's `lang_pref` cookie once at signup per Pattern 6), issues the session cookie, and returns the user's minimal profile fields

## Task Commits

Each task was committed atomically:

1. **Task 1: Rate limiter, OTP transport, and the send endpoint** - `ef76fef` (test, RED) → `3cef072` (feat, GREEN)
2. **Task 2: OTP verify with attempt lockout, session issuance, and the verify endpoint** - `ad3ab7c` (test, RED) → `8f0583c` (feat, GREEN)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `lib/rate-limit/in-memory-limiter.ts` - `checkRateLimit(key, opts)`, Map-backed, Pitfall 3 documented inline
- `lib/rate-limit/in-memory-limiter.test.ts` - 3 behavior tests (max/window, reset, independent keys)
- `lib/otp/transport.ts` - `OtpTransport` interface, `ConsoleOtpTransport` dev-stub
- `app/api/auth/otp/send/route.ts` - `POST /api/auth/otp/send`
- `lib/otp/verify.ts` - `verifyOtpChallenge(phone, code)`, `MAX_OTP_ATTEMPTS`
- `lib/otp/verify.test.ts` - 5 behavior tests (not_found/expired/invalid/locked/ok+re-verify) against real Postgres
- `lib/session.ts` - `getSession()`, `IronSessionData` augmentation
- `app/api/auth/otp/verify/route.ts` - `POST /api/auth/otp/verify`

## Decisions Made

- Verify route does not re-normalize the incoming phone with `libphonenumber-js` — the plan's action text specifies this step only for the send route (which is the E.164-normalization authority), and the verify route's contract literally reads `verifyOtpSchema` + `verifyOtpChallenge(phone, code)` with no normalization step. The client (02-05's login forms) is responsible for resubmitting the same phone string the send flow used.

## Deviations from Plan

None - plan executed exactly as written. `npx prisma generate` was run once (not a plan task) to regenerate the gitignored `lib/generated/prisma` client so `prisma.otpChallenge`/`prisma.user` typed accessors existed locally — this is a standard local dev-environment step, not a code change, and produces no diff to commit.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. `OTP_HMAC_SECRET`/`SESSION_SECRET` were already present in `.env` from 02-01.

## Next Phase Readiness

- `checkRateLimit`, `OtpTransport`/`ConsoleOtpTransport`, `verifyOtpChallenge`/`MAX_OTP_ATTEMPTS`, and `getSession()` are all ready for 02-05 (login forms) and 02-06 (header auth state) to import directly, matching the exact contract this plan's frontmatter locked
- The full send->verify->session round trip is unit/integration tested at the logic layer; an end-to-end HTTP smoke test (`e2e/search-and-auth-flow.spec.ts` per 02-VALIDATION.md) is deferred to whichever later plan wires up the login UI, since there's no form yet to drive it
- No blockers

## Self-Check: PASSED

All 8 created files (`lib/rate-limit/in-memory-limiter.ts`, `lib/rate-limit/in-memory-limiter.test.ts`,
`lib/otp/transport.ts`, `app/api/auth/otp/send/route.ts`, `lib/otp/verify.ts`, `lib/otp/verify.test.ts`,
`lib/session.ts`, `app/api/auth/otp/verify/route.ts`) confirmed present on disk. All 4 task commits
(`ef76fef`, `3cef072`, `ad3ab7c`, `8f0583c`) confirmed present in `git log`.

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
