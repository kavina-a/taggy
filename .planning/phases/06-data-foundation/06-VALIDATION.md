---
phase: 6
slug: data-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-24
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.0.0 (unit/integration), Playwright 1.63.0 (e2e) — both already configured |
| **Config file** | `vitest.setup.ts` (loads `dotenv/config` for `OTP_HMAC_SECRET`/`SESSION_SECRET`); Playwright config drives `npm run test:e2e` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test:e2e` |
| **Estimated runtime** | ~60-120 seconds (unit) + e2e suite |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run test:e2e`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-XX | TBD | 1 | DATA-03 | — | `isTest:false` filter applied on every business/review/user read path | unit/integration | `vitest run lib/search/run-search-query.test.ts lib/home/load-rails.test.ts` (extended with an `isTest:true` fixture that must never appear) | ❌ W0 | ⬜ pending |
| 06-01-XX | TBD | 1 | DATA-04 | — | No `picsum.photos` URL in any seeded `BusinessPhoto.url` | unit | New test: `businessesData.every(b => b.photos.every(p => !p.url.includes("picsum")))` | ❌ W0 | ⬜ pending |
| 06-01-XX | TBD | 1 | DATA-05 | — | Category chips render human labels, not slugs | unit | `vitest run components/business/business-page.test.tsx` (extend existing `mockBusiness` assertion to check rendered badge text) | ❌ W0 | ⬜ pending |
| 06-02-XX | TBD | 2 | DATA-06 | — | Every seeded business has 5-60 reviews, 80-400 words, dates over 3 years | unit | New test over generator output: word-count/date-range assertions | ❌ W0 | ⬜ pending |
| 06-02-XX | TBD | 2 | DATA-07 | — | Vote counts and photo tags present and consistent | unit | `ReviewVote` count matches denormalized `usefulCount`/`funnyCount`/`coolCount` per review | ❌ W0 | ⬜ pending |
| 06-02-XX | TBD | 2 | DATA-08 | — | 0-5 Q&A threads per business with answers | unit | New test over `generate-qa.ts` output | ❌ W0 | ⬜ pending |
| 06-02-XX | TBD | 2 | DATA-09 | — | 60+ users with avatar/name/city/counts/eliteYear | unit | `expect(usersData.length).toBeGreaterThanOrEqual(60)` + per-field presence checks | ❌ W0 | ⬜ pending |
| 06-03-XX | TBD | 3 | DATA-10 | — | `generateMetadata` on home/search/business pages, no "localhost" | e2e | New Playwright assertion on `page.title()` for `/`, `/search?...`, `/business/[slug]` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. Task IDs finalized once PLAN.md files exist.*

---

## Wave 0 Requirements

All covered directly by tasks in the 7 approved PLAN.md files (confirmed by plan-checker
2026-09-25) — no separate Wave 0 pass needed:

- [x] `prisma/seed-data/generators/generate-reviews.test.ts` — word-count, date-spread, rating-distribution assertions (06-07)
- [x] `prisma/seed-data/generators/generate-qa.test.ts` — 0-5 threads per business (06-04)
- [x] `lib/search/run-search-query.test.ts` — extended with an `isTest:true` fixture that must never appear in results (06-02)
- [x] `lib/home/load-rails.test.ts` — same `isTest` exclusion assertion for rails (06-02)
- [x] `components/business/business-page.test.tsx` — extended to assert rendered badge text uses `getCategoryLabel`, not the raw slug, for both primary and secondary category chips (06-06)
- [x] `e2e/data-foundation-metadata.spec.ts` — asserts page `<title>` for `/`, `/search`, `/business/[slug]` is never the literal string `"localhost"` and matches the spec's format pattern (06-06)

---

## Manual-Only Verifications

*None — all phase behaviors have automated verification per the map above.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-25 (gsd-plan-checker VERIFICATION PASSED)
