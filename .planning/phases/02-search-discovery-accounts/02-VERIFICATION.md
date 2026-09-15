---
phase: 02-search-discovery-accounts
verified: 2026-09-15T05:07:46Z
status: passed
score: 10/10 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 2: Search, Discovery & Accounts Verification Report

**Phase Goal:** Users can find businesses in the seeded directory through search, filters, and ranking, and can browse entirely as guests, signing up only when they're ready to take an action.
**Mode:** mvp
**Verified:** 2026-09-15T05:07:46Z
**Status:** passed
**Re-verification:** No — initial verification

**Ground truth accepted from orchestrator (not re-run by this agent, per task instructions):** `npm run build` clean · `npx vitest run` 137/137 passing · `npx playwright test` 3/3 passing (`directory-to-business`, `guest-browsing` zero-redirect, `search-and-auth-flow` smoke). This verification instead spent its budget on independent source-level inspection of the actual implementation files (not SUMMARY.md claims).

## User Flow Coverage (MVP Mode)

User story (from 02-09-PLAN.md's Phase Goal, matching ROADMAP.md's Phase 2 goal): *As a Colombo consumer, I want to search, filter, and browse the business directory entirely as a guest, signing up via phone OTP only when I'm ready, so that I can quickly decide where to eat, shop, or hire a local service without friction or a forced login.*

| Step | Expected | Evidence in codebase | Status |
|------|----------|----------------------|--------|
| Land on home, see search bar + rails | Hero + working `SearchBar` + 3 rails, never a rating-driven rail | `app/page.tsx` renders exactly `SearchBar`, two `DiscoveryRail`s ("Trending Near You", "New Businesses"), and `CategoryShortcuts` — zero hits for "top rated" anywhere in `app/` or `components/` (grep confirmed) | VERIFIED |
| Search by free text + location | Ranked, real business results as cards + map | `app/search/page.tsx` calls `runSearchQuery(filters)` (real `$queryRaw` over `Business`) and passes real `initialResult` into `SearchExperience`, which renders `BusinessCard` per result and a Leaflet `SearchResultsMapDynamic` | VERIFIED |
| Filter and sort results | Category/price/open-now/distance/rating(disabled)/attributes filters; 4 sort options; results reorder | `components/search/filter-fields.tsx` (shared by sidebar+sheet) renders all filter controls; rating chips above "Any" are `disabled` with `title="Ratings launch in a future update"`; `sort-dropdown.tsx` offers exactly the 4 locked options; `run-search-query.ts`'s `applySort` implements all 4 | VERIFIED |
| Open a business page as guest | No auth wall, real content | `e2e/guest-browsing.spec.ts` asserts a seeded business page renders its heading and the header's "Log in" CTA stays visible (i.e., no redirect) | VERIFIED |
| Sign up only when ready, via phone OTP | Guest clicks Log in, gets OTP, verifies, becomes logged in; nothing before this gated | `e2e/search-and-auth-flow.spec.ts` walks exactly this path end to end (home→search→filter→business page→`/login`→OTP send/verify using the dev-mode `devCode`→logged-in header) | VERIFIED |
| Never forced through a full profile | Optional, dismissible name prompt shown once | `ProgressiveProfileDialog` only renders when `!user.hasSeenProfilePrompt` (`app/login/page.tsx:26`); both Save and Skip call the same `POST /api/auth/profile`, which unconditionally sets `hasSeenProfilePrompt: true` | VERIFIED |

All 6 flow steps verified against source, not SUMMARY narrative.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | (SC1/SRCH-01/02) Free-text + geo search returns ranked cards (photo/name/category/price/rating-or-honest-fallback/distance/snippet/open-closed) + map with pins | ✓ VERIFIED | `lib/search/run-search-query.ts` (real parameterized `$queryRaw`); `components/directory/business-card.tsx` shows `reviewCount ? "${n} reviews" : "No reviews yet"` (line 140) — no fabricated rating; `components/search/search-results-map(-dynamic).tsx` renders pins |
| 2 | (SC2/SRCH-03/04) Category/price/open-now/distance/rating-threshold/attribute filters compose with AND; 4 sort options reorder results | ✓ VERIFIED | `lib/search/run-search-query.ts` `buildFilterConditions` (AND-joined `Prisma.sql` conditions) + `applySort`; `components/search/filter-fields.tsx`, `filter-sidebar.tsx` (desktop), `filter-sheet.tsx` (mobile), `sort-dropdown.tsx` |
| 3 | (SC2 pitfall) Rating-threshold filter above "Any" never silently returns zero results — visibly disabled instead | ✓ VERIFIED | `filter-fields.tsx:171-186` — `disabled={option !== "any"}`, `title="Ratings launch in a future update"`; `run-search-query.ts:108-111` comment confirms it is deliberately excluded from the WHERE clause; `filter-sidebar.test.tsx` asserts the disabled-chip behavior |
| 4 | (SC3/SRCH-05) "Recommended" sort blends text relevance + geo-decay + a non-fabricated rating term, isolated from future ad interleaving | ✓ VERIFIED | `run-search-query.ts:44-59,125-141` — `W_TEXT`/`W_GEO`/`W_RATING` named weights, `RATING_SCORE_NEUTRAL = 0.5` hardcoded neutral scalar (never a computed average) with an explicit `TODO(Phase 3)` comment tied to D-02; score computed in one isolated SQL expression |
| 5 | (SC4/SRCH-06) Home page shows exactly 3 rails, never "Top Rated"; empty rails hide entirely; category tiles deep-link | ✓ VERIFIED | `app/page.tsx` — 2 `DiscoveryRail` + 1 `CategoryShortcuts`; zero "top rated" hits repo-wide (grep -ri); `discovery-rail.tsx:121` `if (businesses.length === 0) return null` (component returns null, confirmed) |
| 6 | (SC5/AUTH-02/D-05) Guest browsing has zero login prompts/redirects on every Phase 2 page | ✓ VERIFIED | `e2e/guest-browsing.spec.ts` explicitly loads `/`, `/search`, `/search?find_desc=cafe`, `/business/{slug}`, `/login` in one cookie-less Playwright context and asserts real content + a visible "Log in" CTA (i.e., no redirect) on every one; `app/layout.tsx` reads session read-only, never `redirect()`s |
| 7 | (AUTH-01) Phone OTP signup/login is real: hashed codes, rate-limited, real session issued | ✓ VERIFIED | `lib/otp/generate.ts` — HMAC-SHA256 hash, `timingSafeEqual` constant-time compare, never stores plaintext; `lib/otp/verify.ts` — expiry check, `MAX_OTP_ATTEMPTS=5` lockout; `app/api/auth/otp/send/route.ts` — real `checkRateLimit` (per-phone 3/min, per-IP 10/min) before any DB write, existence-blind response; `lib/session.ts` — real `iron-session` sealed httpOnly cookie (`secure` in prod, `sameSite: lax`) |
| 8 | (AUTH-03) Progressive profile prompt is optional, shown exactly once | ✓ VERIFIED | `components/auth/progressive-profile-dialog.tsx`; gating in `app/login/page.tsx:26` (`if (!user.hasSeenProfilePrompt)`); `app/api/auth/profile/route.ts` sets `hasSeenProfilePrompt: true` unconditionally on Save or Skip |
| 9 | (LOC-01) `language_pref` field exists and drives a header switcher (en/si/ta), persists without changing other strings | ✓ VERIFIED | `prisma/schema.prisma` `User.languagePref` (default "en"); `components/layout/language-switcher.tsx` — persists via cookie (guest) or `POST /api/auth/language` (logged in), shows only the one "coming soon" note for si/ta |
| 10 | Logging out immediately returns to unrestricted guest browsing, no confirmation | ✓ VERIFIED | `app/api/auth/logout/route.ts` — `session.destroy()`, 303 redirect to `/` for the real `<form method="post">` in the header (`app/layout.tsx:88`) |

**Score:** 10/10 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/schema.prisma` | `User`, `OtpChallenge` models; `searchable` tsvector + GIN; pg_trgm | ✓ VERIFIED | Confirmed models (lines 75-96), `Unsupported("tsvector")` + `@@index(..., type: Gin)` (lines 24-34) |
| `prisma/migrations/20260915000009_add_search_and_auth/migration.sql` | Real generated column + trigram index | ✓ VERIFIED | `CREATE EXTENSION pg_trgm`, `GENERATED ALWAYS AS (...) STORED` tsvector column, `User`/`OtpChallenge` tables, GIN + trigram indexes all present |
| `lib/otp/generate.ts` | `generateOtpCode`/`hashOtpCode`/`verifyOtpCode`/`OTP_EXPIRY_MS` | ✓ VERIFIED | All 4 exports present, HMAC-SHA256 + `timingSafeEqual`, no plaintext storage |
| `lib/search/run-search-query.ts` | `runSearchQuery`, `SEARCH_PAGE_SIZE` | ✓ VERIFIED | Fully parameterized `Prisma.sql`/`Prisma.join` raw query, no string concatenation of request-derived input (see Key Link Verification) |
| `lib/search/geo-decay.ts` | `geoDecayScore(distanceKm, offsetKm?, scaleKm?)` | ✓ VERIFIED | Exponential decay formula, matches SQL expression in `run-search-query.ts` |
| `lib/search/district-centroids.ts` | `districtCentroids`, `findNearestDistrict`, `lookupDistrictCentroid` | ✓ VERIFIED | 12 seeded districts with real lat/lng centroids |
| `lib/session.ts` | `getSession()` iron-session helper | ✓ VERIFIED | Real sealed httpOnly cookie, `SESSION_SECRET` env-driven |
| `app/search/page.tsx` | SSR entry calling `runSearchQuery` | ✓ VERIFIED | Real Prisma-backed call, passes real data to `SearchExperience` |
| `app/api/search/route.ts` | JSON route, identical ranking | ✓ VERIFIED | Same `runSearchQuery`/`buildSearchFiltersFromParams`/`serializeSearchResult` helpers as the SSR page |
| `components/search/filter-sidebar.tsx` / `filter-sheet.tsx` | Desktop/mobile filter controls | ✓ VERIFIED | Both compose the shared `FilterFields`; rating chips disabled per design |
| `components/search/sort-dropdown.tsx` | 4-option sort control | ✓ VERIFIED | Locked option list, matches `run-search-query.ts`'s sort union |
| `app/page.tsx` | Home: hero + search + 3 rails | ✓ VERIFIED | Confirmed above |
| `components/home/discovery-rail.tsx` | Hides when empty | ✓ VERIFIED | `if (businesses.length === 0) return null` |
| `components/home/category-shortcuts.tsx` | Taxonomy-driven grid → `/search?category=` | ✓ VERIFIED | Confirmed link pattern (`category-shortcuts.tsx`, checked against `app/search/page.tsx`'s `category` param handling) |
| `app/login/page.tsx` | Phone entry → OTP entry two-step flow | ✓ VERIFIED | Two-step state machine, progressive-profile gating, `router.refresh()` fix noted in 02-09 summary |
| `components/auth/progressive-profile-dialog.tsx` | Non-blocking name prompt, shown once | ✓ VERIFIED | Confirmed above |
| `app/api/auth/profile/route.ts` | Persists name + `hasSeenProfilePrompt` | ✓ VERIFIED | Confirmed via layout/login wiring |
| `app/layout.tsx` | Real session-backed header | ✓ VERIFIED | Reads `getSession()` + real `prisma.user.findUnique`, never redirects |
| `app/api/auth/logout/route.ts` | Destroys session | ✓ VERIFIED | Confirmed above |
| `components/layout/language-switcher.tsx` | en/si/ta switcher | ✓ VERIFIED | Confirmed above |
| `app/api/auth/language/route.ts` | Persists `languagePref` | ✓ VERIFIED | Exists, wired from `language-switcher.tsx` |
| `e2e/guest-browsing.spec.ts` | Zero-redirect assertion, all Phase 2 pages | ✓ VERIFIED | 5 pages asserted (home, `/search` empty, `/search?find_desc=cafe`, business page, `/login`), each checks real content + visible "Log in" CTA |
| `e2e/search-and-auth-flow.spec.ts` | Full cross-cutting smoke path | ✓ VERIFIED | 9-step path: home search → land on `/search` → filter → business page → `/login` → OTP send/verify via `devCode` → progressive-profile Skip → logged-in header |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `lib/search/run-search-query.ts` | `lib/hours/compute-open-now.ts` | Imported verbatim, applied as in-memory post-filter | ✓ WIRED | `filterOpenNow()` imports and calls `computeOpenNow` per business, over one batched `findMany` |
| `app/search/page.tsx` | `lib/search/run-search-query.ts` | `await runSearchQuery(filters)` | ✓ WIRED | Confirmed direct call |
| `app/api/search/route.ts` | `lib/search/run-search-query.ts` | Same call, no duplicated ranking | ✓ WIRED | Confirmed identical helper chain to the SSR page |
| `components/search/otp-entry-form.tsx` | `app/api/auth/otp/verify/route.ts` | `fetch('/api/auth/otp/verify', ...)` | ✓ WIRED | Confirmed via `search-and-auth-flow.spec.ts` passing end to end |
| `app/api/auth/otp/verify/route.ts` | `lib/session.ts` | `getSession()` then `session.save()` | ✓ WIRED | `route.ts:39-42` — `session.userId = user.id; session.phone = user.phone; await session.save()` |
| `app/api/auth/otp/send/route.ts` | `lib/rate-limit/in-memory-limiter.ts` | `checkRateLimit(...)` before any DB write | ✓ WIRED | Confirmed order of operations in source |
| `app/layout.tsx` | `lib/session.ts` | `await getSession()` server-side | ✓ WIRED | Confirmed, read-only, no redirect |
| `components/layout/language-switcher.tsx` | `app/api/auth/language/route.ts` | `fetch('/api/auth/language', ...)` | ✓ WIRED | Confirmed in `handleChange` |
| `components/home/category-shortcuts.tsx` | `app/search/page.tsx` | `Link href="/search?category=${slug}"` | ✓ WIRED | Confirmed pattern present; `search-params.schema.ts` parses `category` |
| `components/search/filter-sidebar.tsx` | `app/api/search/route.ts` | Debounced client fetch for live filter updates | ✓ WIRED | `use-search-filter-state.ts` → `SearchExperience` orchestrates fetch + `router`-independent URL sync (`window.history.replaceState`) |

### SQL Injection / Parameterization Check (explicit ask #4)

`lib/search/run-search-query.ts` builds every raw query exclusively through `Prisma.sql`/`Prisma.join` tagged templates. Every request-derived value (`textQuery`, `categories`, `priceTiers`, attribute keys/values, `originLat`/`originLng`, `radiusKm`) is passed as a template placeholder (`${...}`), never interpolated into a raw string before being handed to `$queryRaw`. No `String.prototype.concat`, template-literal SQL building outside `Prisma.sql`, or `Prisma.raw` calls with request-derived content were found in this file. **No injection risk identified.**

### OTP / Session Security Check (explicit ask #5)

- `lib/otp/generate.ts`: codes are HMAC-SHA256 hashed (`OTP_HMAC_SECRET`-keyed) before storage; comparison uses `timingSafeEqual` with an explicit length-guard (avoids the throw-on-mismatched-length footgun); no plaintext code is ever persisted.
- `lib/otp/verify.ts`: real expiry check (`challenge.expiresAt < new Date()`), real attempt lockout (`MAX_OTP_ATTEMPTS = 5`, incremented in the DB on each wrong guess), consumed-challenge exclusion via `consumedAt: null` in the lookup.
- `app/api/auth/otp/send/route.ts`: real per-phone (3/min) and per-IP (10/min) rate limiting enforced via `lib/rate-limit/in-memory-limiter.ts` before any `OtpChallenge` row is created; response is existence-blind (identical shape regardless of whether the phone is already registered); `devCode` is gated behind `NODE_ENV !== "production"`.
- `lib/session.ts`: real `iron-session` sealed (encrypted + integrity-checked) httpOnly cookie, `secure` in production, `sameSite: lax` — not a client-readable JWT, not stubbed.

None of these are stubbed placeholders — all are real, functioning implementations matching their documented threat mitigations (T-02-02, T-02-04, T-02-05, T-02-06, T-02-07).

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|-----------------|-------------|--------|----------|
| SRCH-01 | 02-02, 02-04 | Search bar (free-text + geo) returns ranked results | ✓ SATISFIED | `run-search-query.ts`, `search-bar.tsx`, `app/search/page.tsx` |
| SRCH-02 | 02-04, 02-08 | Results page: cards + map with pins | ✓ SATISFIED | `business-card.tsx` (extended), `search-results-map(-dynamic).tsx` |
| SRCH-03 | 02-02, 02-08 | Filters: category/price/open-now/distance/rating/attributes | ✓ SATISFIED | `filter-fields.tsx`, `run-search-query.ts` `buildFilterConditions` |
| SRCH-04 | 02-02, 02-08 | 4 sort options | ✓ SATISFIED | `sort-dropdown.tsx`, `applySort` |
| SRCH-05 | 02-02 | Recommended sort blends relevance+geo-decay+rating, isolated | ✓ SATISFIED | Weighted score formula, `RATING_SCORE_NEUTRAL` (honest per D-02) |
| SRCH-06 | 02-07 | Home rails + category shortcuts | ✓ SATISFIED | `app/page.tsx`, 3 sections per D-09 |
| AUTH-01 | 02-01, 02-03, 02-05 | Phone OTP signup/login (email optional) | ✓ SATISFIED | OTP pipeline is fully real; email is schema-only, not built as a parallel login path — explicitly left to planning discretion by CONTEXT.md's "Claude's Discretion" section, not a gap |
| AUTH-02 | 02-09 | Guest browsing fully supported, zero login prompts | ✓ SATISFIED | `e2e/guest-browsing.spec.ts`, `app/layout.tsx` read-only session pattern |
| AUTH-03 | 02-05 | Progressive profile, no forced full-profile step | ✓ SATISFIED | `progressive-profile-dialog.tsx` |
| LOC-01 | 02-01, 02-06 | `language_pref` field + switcher | ✓ SATISFIED | `User.languagePref`, `language-switcher.tsx` |

**Orphaned requirements:** None. Cross-referenced against REQUIREMENTS.md's Phase 2 traceability row (`SRCH-01..06, AUTH-01..03, LOC-01 | Phase 2`) — every ID declared across the 9 plans' `requirements:` frontmatter is accounted for, and no additional Phase-2-mapped ID in REQUIREMENTS.md is missing from a plan.

**Note (informational, not a gap):** REQUIREMENTS.md's traceability table still shows these 10 IDs' Status column as "Pending" even though the individual requirement checkboxes at the top of the file are already checked `[x]`. This is a documentation staleness item in REQUIREMENTS.md itself, not an implementation gap — the codebase evidence above confirms all 10 are actually satisfied.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `lib/search/run-search-query.ts` | 57 | `TODO(Phase 3): replace with a real Bayesian-shrinkage expression once review data exists` | ℹ️ Info | References formal, documented future work (Phase 3, tied to CONTEXT.md D-02) — not a debt marker requiring resolution now; intentional and honest per the phase's own design decision |

No `TBD`/`FIXME`/`XXX` markers found in any phase-touched file. No placeholder/"coming soon"/stub patterns found outside the deliberate, documented si/ta "coming soon" UI copy (which is itself a must-have, not a stub). No empty-return stubs, no hardcoded-empty-array props feeding real UI, no console.log-only handlers.

### Behavioral Spot-Checks

Per task instructions, the orchestrator had already run and confirmed the full automated suites immediately before spawning this verification (`npm run build` clean, `npx vitest run` 137/137, `npx playwright test` 3/3 including `guest-browsing` and `search-and-auth-flow`). This agent did not re-run them, and instead traced the actual assertions inside both e2e specs (reproduced above) to confirm they exercise the real behaviors they claim to, rather than trusting the pass count alone.

### Probe Execution

N/A — no `scripts/*/tests/probe-*.sh` convention or phase-declared probes found in this project; Phase 2's validation architecture uses Vitest + Playwright exclusively (per 02-VALIDATION.md).

### Human Verification Required

None. All must-haves resolved via source-level inspection; no behavior-dependent truth (state transition / cancellation / cleanup invariant) lacked a corresponding passing test — OTP lockout, session issuance, and guest zero-redirect are all exercised by the existing automated suite (confirmed green by the orchestrator) and independently traced against source in this report.

### Gaps Summary

No gaps found. All 10 requirement IDs (SRCH-01 through 06, AUTH-01 through 03, LOC-01) are satisfied with real, wired, non-stub implementations. All 5 ROADMAP.md Phase 2 success criteria are observably true in the codebase. The two context-flagged risk areas (D-09 "no Top Rated rail" and D-02 "no fabricated ratings") were independently confirmed absent/honest via direct grep and source reading, not taken on SUMMARY.md's word. Phase goal achieved.

---

*Verified: 2026-09-15T05:07:46Z*
*Verifier: Claude (gsd-verifier)*
