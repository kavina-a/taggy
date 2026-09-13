---
phase: 1
slug: business-directory-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.0.0 (unit/component) + Playwright `@playwright/test` 1.63.0 (e2e) — neither installed yet, greenfield repo |
| **Config file** | none — Wave 0 installs `vitest.config.ts` and `playwright.config.ts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~30-60s (unit/component) + ~30-60s (e2e smoke) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` (fast unit/component subset relevant to the task)
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01 | TBD | 0 | LIST-01 | — | N/A | component | `npx vitest run components/business/business-page.test.tsx` | ❌ W0 | ⬜ pending |
| 01-02 | TBD | 0 | LIST-02 | — | N/A | unit | `npx vitest run lib/hours/compute-open-now.test.ts` | ❌ W0 | ⬜ pending |
| 01-03 | TBD | 0 | LIST-03 | — | N/A | unit | `npx vitest run lib/categories/category-config.test.ts` | ❌ W0 | ⬜ pending |
| 01-04 | TBD | 0 | LIST-04 | — | N/A | component | `npx vitest run components/business/photo-gallery.test.tsx` | ❌ W0 | ⬜ pending |
| 01-05 | TBD | 0 | LIST-05 | — | N/A | unit | `npx vitest run lib/categories/category-config.test.ts` | ❌ W0 (same file as LIST-03) | ⬜ pending |
| 01-06 | TBD | 0 | LIST-06 | — | N/A | integration | `npx tsx prisma/seed.ts && npx tsx prisma/seed.ts` (run twice, assert row count stable) | ❌ W0 | ⬜ pending |
| 01-07 | TBD | 0 | LOC-02 | — | N/A | unit | `npx vitest run lib/validation/business.schema.test.ts` | ❌ W0 | ⬜ pending |
| 01-08 | TBD | 0 | (cross-cutting) | — | N/A | e2e | `npx playwright test e2e/directory-to-business.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Plan/Wave/Task-ID columns are placeholders — the planner assigns actual plan IDs and waves; this table's Requirement/Test/Command mapping is locked from RESEARCH.md's Validation Architecture and must not be dropped.*

---

## Wave 0 Requirements

- [ ] Install Vitest + Testing Library + Playwright, add `vitest.config.ts` and `playwright.config.ts`
- [ ] `lib/hours/compute-open-now.test.ts` — covers LIST-02, especially the overnight-shift +
      holiday-override interaction flagged as a domain pitfall in RESEARCH.md (write these
      test cases before implementation, given the correctness risk)
- [ ] `prisma/seed.test.ts` or an npm script that runs the seed twice and asserts row count
      parity — covers LIST-06's idempotency requirement
- [ ] `e2e/directory-to-business.spec.ts` — one smoke path covering the full phase
      (directory index → business page → "Open now" badge visible)

---

## Manual-Only Verifications

*None — all phase behaviors have automated verification per the map above.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

Verified by gsd-plan-checker against the 4 approved plans (01-01..01-04): every mapped
test file/command is present and correctly wired (01-01→`business-page.test.tsx` &
`business.schema.test.ts`, 01-02→`compute-open-now.test.ts`, 01-03→`category-config.test.ts`,
01-04→`photo-gallery.test.tsx` & seed idempotency check, cross-cutting→
`directory-to-business.spec.ts`).

**Approval:** approved 2026-09-13
