---
phase: 2
slug: search-discovery-accounts
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.0.0 (unit/component) + Playwright `@playwright/test` 1.63.0 (e2e) — both already installed and configured by Phase 1 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` (existing, Phase 1) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~30-60s (unit/component) + ~30-60s (e2e) |

---

## Sampling Rate

- **After every task commit:** `npx vitest run` (fast unit/component subset relevant to the task)
- **After every plan wave:** `npx vitest run && npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01 | TBD | 0 | SRCH-01 | — | N/A | integration | `npx vitest run lib/search/run-search-query.test.ts` | ❌ W0 | ⬜ pending |
| 02-02 | TBD | 0 | SRCH-02 | — | N/A | component | `npx vitest run components/search/search-result-card.test.tsx` | ❌ W0 | ⬜ pending |
| 02-03 | TBD | 0 | SRCH-03 | — | N/A | unit+integration | `npx vitest run lib/search/run-search-query.test.ts` | ❌ W0 (same file as SRCH-01) | ⬜ pending |
| 02-04 | TBD | 0 | SRCH-04 | — | N/A | unit | `npx vitest run lib/search/run-search-query.test.ts` | ❌ W0 (same file) | ⬜ pending |
| 02-05 | TBD | 0 | SRCH-05 | — | N/A | unit | `npx vitest run lib/search/geo-decay.test.ts` | ❌ W0 | ⬜ pending |
| 02-06 | TBD | 0 | SRCH-06 | — | N/A | component | `npx vitest run components/home/discovery-rail.test.tsx` | ❌ W0 | ⬜ pending |
| 02-07 | TBD | 0 | AUTH-01 | T-02-* | OTP hashed (HMAC-SHA256), rate-limited, expires | integration | `npx vitest run lib/otp/verify.test.ts` | ❌ W0 | ⬜ pending |
| 02-08 | TBD | 0 | AUTH-02 | — | No auth redirect for guest browsing | e2e | `npx playwright test e2e/guest-browsing.spec.ts` | ❌ W0 | ⬜ pending |
| 02-09 | TBD | 0 | AUTH-03 | — | N/A | component | `npx vitest run components/auth/progressive-profile-dialog.test.tsx` | ❌ W0 | ⬜ pending |
| 02-10 | TBD | 0 | LOC-01 | — | N/A | component | `npx vitest run components/layout/language-switcher.test.tsx` | ❌ W0 | ⬜ pending |
| 02-11 | TBD | 0 | (cross-cutting) | — | N/A | e2e | `npx playwright test e2e/search-and-auth-flow.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Plan/Wave/Task-ID columns are placeholders — the planner assigns actual plan IDs and waves; this table's Requirement/Test/Command mapping is locked from RESEARCH.md's Validation Architecture and must not be dropped.*

---

## Wave 0 Requirements

- [ ] `lib/search/run-search-query.test.ts` — covers SRCH-01/03/04, especially the
      open-now post-filter's interaction with pagination (reuse Phase 1's overnight-shift
      fixture shape)
- [ ] `lib/search/geo-decay.test.ts` — golden-value tests for the decay curve and combined
      score formula (SRCH-05)
- [ ] `lib/otp/generate.test.ts` + `lib/otp/verify.test.ts` — code generation range,
      hash/verify round trip, expiry boundary, attempt-count lockout (AUTH-01)
- [ ] `e2e/guest-browsing.spec.ts` — asserts zero auth redirects across all Phase 2 pages
      (AUTH-02, the single most important regression to catch given CONTEXT.md D-05)
- [ ] `e2e/search-and-auth-flow.spec.ts` — one smoke path covering the full phase
- [ ] `OTP_HMAC_SECRET` / `SESSION_SECRET` env vars added to `.env.example` and local
      `.env` before any OTP/session test can run against a real (non-mocked) session
      helper

---

## Manual-Only Verifications

*None — all phase behaviors have automated verification per the map above.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
