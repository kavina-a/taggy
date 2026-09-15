---
phase: 02-search-discovery-accounts
plan: 06
subsystem: auth-ui
tags: [nextjs-server-components, iron-session, prisma, radix-select, shadcn-dropdown-menu, vitest, testing-library]

# Dependency graph
requires:
  - phase: 02-search-discovery-accounts (Plan 03)
    provides: "getSession() sealed httpOnly cookie helper, iron-session"
  - phase: 02-search-discovery-accounts (Plan 05)
    provides: "GET /login two-step phone-OTP flow (now has its first in-app entry point)"
provides:
  - "app/layout.tsx — real session-backed global header (guest 'Log in' CTA vs. logged-in avatar+dropdown), visible on every page"
  - "POST /api/auth/logout — destroys the session; redirects a plain form POST back to '/', returns {ok:true} JSON to a fetch caller"
  - "LanguageSwitcher — en/si/ta shadcn select, cookie (guest) or User.languagePref (logged in) persistence, 'coming soon' note for si/ta only"
  - "POST /api/auth/language — persists languagePref for the session's own user, no-ops for a guest caller"
affects: [02-09-e2e-smoke-test]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Root layout (app/layout.tsx) stays a pure async Server Component: reads getSession()/prisma.user directly, never redirects or throws on a missing session, so header auth state can never accidentally gate a page (T-02-09)"
    - "Interactive header controls compose already-'use client' shadcn primitives (select, dropdown-menu, avatar) directly from the Server Component — no extra client wrapper needed since no function props cross the server/client boundary; the logout action is a native <form method='post'> submit instead of an onClick handler"
    - "Guest lang_pref cookie set via document.cookie (no round trip); logged-in languagePref persisted via POST /api/auth/language reading userId only from the session cookie (T-02-12)"

key-files:
  created:
    - components/layout/language-switcher.tsx
    - components/layout/language-switcher.test.tsx
    - app/api/auth/language/route.ts
    - app/api/auth/logout/route.ts
  modified:
    - app/layout.tsx

key-decisions:
  - "POST /api/auth/logout redirects (303) a plain form submission back to '/' instead of the plan's literal bare JSON response, detected via Content-Type: a native <form method=post> logout control has no client JS to redirect after a JSON reply, which would strand the user on a raw JSON page instead of 'immediately returning to full guest browsing' (the plan's own must_have). A fetch-style JSON caller still gets the plan's literal {ok:true}."
  - "Radix's DropdownMenuItem/SelectItem/SelectTrigger primitives are already 'use client' components; app/layout.tsx renders them directly without becoming a client component itself, and the logout item avoids passing any function prop across the server/client boundary by wrapping a submit <button> in a plain <form>."

patterns-established:
  - "Testing Radix Select in jsdom: fireEvent.click (not pointer/user-event) opens the trigger and selects an item, because Radix's onClick handlers fire whenever pointerType !== 'mouse', which is jsdom's fireEvent.click default (pointerTypeRef starts as 'touch'). Only scrollIntoView/pointer-capture need a light polyfill for the item-aligned open-positioning logic to run without throwing."

requirements-completed: [LOC-01]

coverage:
  - id: D1
    description: "Every page's header shows a guest 'Log in' CTA (linking to /login) when no session exists, or an avatar+dropdown with 'Log out' when logged in, read from the real getSession()/prisma.user server-side state — never client-guessed"
    requirement: "LOC-01"
    verification:
      - kind: integration
        ref: "manual curl walk-through against npm run dev + local Postgres: GET / as guest shows 'Log in'; after a real send->verify round trip, GET / with the session cookie shows 'Account' + 'Log out'; GET /login and GET /search also render the header consistently"
        status: pass
      - kind: other
        ref: "npm run build (Next.js 16.3.5 Turbopack production build — all routes incl. /api/auth/logout, /api/auth/language compile cleanly); npx tsc --noEmit (exit 0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Logging out clears the session and immediately returns the user to full, unrestricted guest browsing with no confirmation step, for both a native form POST and a JS fetch caller"
    requirement: "LOC-01"
    verification:
      - kind: integration
        ref: "manual curl walk-through: POST /api/auth/logout with Content-Type: application/json returns {ok:true} and clears the session cookie (Set-Cookie: ...Max-Age=0); the same call with Content-Type: application/x-www-form-urlencoded returns 303 redirecting to '/'; a subsequent GET /directory with the cleared cookie returns 200 (guest browsing unrestricted)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Language switcher (English/Sinhala/Tamil) persists the choice for both guests (lang_pref cookie, no server round trip) and logged-in users (POST /api/auth/language -> User.languagePref); selecting si/ta shows the exact 'Sinhala/Tamil UI coming soon — your preference is saved' inline note while every other string on the page stays in English; selecting English shows no note"
    requirement: "LOC-01"
    verification:
      - kind: unit
        ref: "components/layout/language-switcher.test.tsx (5/5 tests pass: English-no-note, Sinhala-note-with-unchanged-surrounding-text, Tamil-note, logged-in-fetch-call, guest-cookie-only-no-fetch)"
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-09-15
status: complete
---

# Phase 2 Plan 06: Session-Aware Header, Logout & Language Switcher Summary

**Real getSession()-backed global header (guest "Log in" CTA vs. logged-in avatar+dropdown) wired into `app/layout.tsx`, plus a persist-only en/si/ta language switcher (cookie for guests, `User.languagePref` for logged-in users) and a logout endpoint that actually returns the user to guest browsing instead of a raw JSON page.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-15T06:38:00+05:30
- **Completed:** 2026-09-15T06:44:00+05:30
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- `app/layout.tsx` extended (still a pure async Server Component) to read `getSession()`/`prisma.user` on every render and show a "Log in" link (guest) or an avatar+"Log out" dropdown (logged in) — never redirects or throws on a missing session, so guest browsing on every other page stays completely unaffected (T-02-09)
- `POST /api/auth/logout` destroys the session; a native `<form method="post">` submission (no client JS) gets a 303 redirect back to `/`, while a JSON `fetch` caller gets the plan's literal `{ ok: true }` — both paths confirmed via a real curl walk-through against the running dev server and local Postgres
- `LanguageSwitcher` (shadcn `select`): English/සිංහල/தமிழ் options; selecting si/ta shows the exact UI-SPEC "coming soon" note and nothing else on the page changes (D-07 — zero translated strings shipped); selecting English shows no note
- `POST /api/auth/language` persists `User.languagePref` for the session's own user only (T-02-12), no-ops for an unauthenticated caller instead of erroring
- `/login` now has its first real in-app entry point (the header CTA) — 02-05's login flow was previously only reachable by direct URL

## Task Commits

Each task was committed atomically:

1. **Task 1: Session-aware header (guest CTA vs. logged-in avatar/dropdown) and logout** - `dd42eac` (feat)
2. **Task 2: Language switcher (persist-only, no translated strings)** - `04c70b4` (test, RED) → `f4e9b0e` (feat, GREEN)

**Plan metadata:** _(pending — final `docs` commit follows this SUMMARY)_

## Files Created/Modified

- `app/layout.tsx` - Session-aware global header (logo/home link, `LanguageSwitcher`, guest CTA / logged-in avatar+dropdown)
- `app/api/auth/logout/route.ts` - `POST /api/auth/logout`
- `components/layout/language-switcher.tsx` - `LanguageSwitcher`
- `components/layout/language-switcher.test.tsx` - 5 behavior tests
- `app/api/auth/language/route.ts` - `POST /api/auth/language`

## Decisions Made

- `POST /api/auth/logout` branches on request `Content-Type` to redirect a native form-POST submission back to `/` (303) while still returning the plan's literal `{ ok: true }` JSON to any other caller — a bare JSON response to a plain-HTML form submit would leave the user staring at raw JSON instead of "immediately returning to full guest browsing," which is one of this plan's own must-have truths.
- The interactive dropdown/select controls are composed directly inside the Server Component `app/layout.tsx` without introducing a client wrapper: since Radix's `select`/`dropdown-menu`/`avatar` primitives are already `"use client"` at the file level, a Server Component can render them as-is, as long as no function prop (e.g. `onSelect`) is passed across the boundary. The "Log out" item avoids that entirely by wrapping a `<button type="submit">` in a plain `<form>`, matching the plan's explicit "a plain form POST ... is acceptable" allowance.
- `LanguageSwitcher`'s tests drive Radix `Select` via `fireEvent.click` (not `user-event`, consistent with 02-04's prior decision to avoid that dependency): Radix's trigger/item `onClick` handlers fire whenever `pointerType !== "mouse"`, which is `jsdom`'s `fireEvent.click` default — only `scrollIntoView`/pointer-capture needed a light polyfill for the item-aligned open-positioning logic to run without throwing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `/api/auth/logout` redirects a form-POST submission instead of always returning bare JSON**
- **Found during:** Task 1 (session-aware header and logout)
- **Issue:** The plan's literal action text specifies `session.destroy(); return NextResponse.json({ ok: true })` for the logout route, but the header's "Log out" control (a plain `<form method="post">`, chosen to keep `app/layout.tsx` a pure Server Component) causes the browser to navigate to whatever that route returns. A bare JSON body would strand the user on a raw JSON page — directly contradicting this plan's own must-have truth that logout "immediately returns the user to full, unrestricted guest browsing."
- **Fix:** The route now checks `Content-Type`: a form submission (`application/x-www-form-urlencoded` / `multipart/form-data`) gets a `303` redirect to `/`; any other caller (a JS `fetch`) still gets the plan's literal `{ ok: true }`.
- **Files modified:** `app/api/auth/logout/route.ts`
- **Verification:** Manual curl walk-through — form-content-type POST returns `303` + `location: http://localhost:3000/` + a cleared `Set-Cookie`; JSON-content-type POST returns `{"ok":true}`; a subsequent `GET /directory` with the cleared cookie returns `200`.
- **Committed in:** `dd42eac` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary for the plan's own must-have ("no confirmation step... immediately returns to guest browsing") to actually hold for the form-POST path the plan itself named as an acceptable implementation choice. No scope creep — the JSON contract the plan specified is still honored for any other caller.

## Issues Encountered

None — Radix `Select` testing in `jsdom` (a first use of the `select` primitive in this codebase) worked on the first `fireEvent.click`-based attempt once `scrollIntoView` was polyfilled; no iteration needed.

## User Setup Required

None - no external service configuration required. All dependencies (`iron-session`, `zod`, shadcn `select`/`dropdown-menu`/`avatar`) were already installed by 02-01/02-03.

## Next Phase Readiness

- The header is now real, session-backed, and visible on every page (`/`, `/directory`, `/login`, `/search` all confirmed via curl); `/login` finally has an in-app entry point, unblocking 02-05's note that `e2e/search-and-auth-flow.spec.ts` was deferred until this existed
- `LanguageSwitcher`/`POST /api/auth/language` fully close out LOC-01 — persistence works for both guests and logged-in users with zero translated strings shipped, matching D-07 exactly
- No blockers

## Self-Check: PASSED

All 5 created/modified files (`app/layout.tsx`, `app/api/auth/logout/route.ts`,
`components/layout/language-switcher.tsx`, `components/layout/language-switcher.test.tsx`,
`app/api/auth/language/route.ts`) confirmed present on disk. All 3 task commits
(`04c70b4`, `f4e9b0e`, `dd42eac`) confirmed present in `git log`. Full test suite (117/117),
`npx tsc --noEmit`, and `npm run build` all pass clean.

---
*Phase: 02-search-discovery-accounts*
*Completed: 2026-09-15*
