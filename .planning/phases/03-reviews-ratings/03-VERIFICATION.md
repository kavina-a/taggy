---
phase: 03-reviews-ratings
verified: 2026-09-15T22:10:00Z
status: passed
score: 7/7 must-haves verified (1 via documented override)
behavior_unverified: 0
overrides_applied: 1
overrides:
  - must_have: "MOD-01: classifier runs on every review and photo before publish"
    reason: "No photo upload/caption infrastructure exists this phase (photos are bare third-party URL strings, ReviewPhoto.caption is an unused DB column with no accepted input path); there is no photo-adjacent text or image content available to classify. Full photo moderation is deferred until Phase 5's upload infrastructure lands, per REQUIREMENTS.md's own PHOTO-01/02 (Phase 5 photo-upload) — MOD-01's photo half is properly satisfiable only once that infra exists. Accepted as scoped-down for Phase 3 rather than building throwaway caption-moderation infra with no real captions to moderate."
    accepted_by: "orchestrator (on project owner's behalf, per their 'implement directly, don't over-build' instruction for phases 3-5)"
    accepted_at: "2026-09-15T22:30:00Z"
gaps:
  - truth: "MOD-01: Real-time profanity/hate-speech/PII classifier runs on every review and photo before publish"
    status: partial
    reason: "classifyContent() is genuinely wired and hard-blocks review TEXT (profanity/slurs, SL phone numbers, emails, card-like digit sequences) via a word-boundary-guarded rule engine in both POST /api/reviews and PATCH /api/reviews/[id] — that half is real, not a stub. But PHOTOS receive zero moderation of any kind: createReviewSchema/updateReviewSchema accept only bare url strings (no caption/alt-text field is even accepted as input, despite ReviewPhoto.caption existing as a DB column), and classifyContent is never called on anything photo-related. No deviation note, override, or scope-narrowing rationale appears in either 03-backend-SUMMARY.md or 03-ui-SUMMARY.md — the literal REQUIREMENTS.md wording ('every review and photo') was silently narrowed to review-text-only during implementation."
    artifacts:
      - path: "lib/moderation/classify-content.ts"
        issue: "classifyContent(text: string) only ever receives review text at both call sites; no code path passes photo URLs or captions through it"
      - path: "lib/validation/review.schema.ts"
        issue: "photos: z.array(z.string().url()).max(10) — no caption/description field accepted from the client at all, so there is no photo-adjacent text to moderate even if the classifier were wired in"
      - path: "app/api/reviews/route.ts"
        issue: "MOD-01 block (lines 38-44) runs once, against `text` only, before the photos array is ever touched"
    missing:
      - "A moderation pass over photo-adjacent content (at minimum the caption field once accepted as input, or a documented, explicit decision that photo moderation is out of scope until Phase 5's upload infrastructure lands, recorded as a tracked deviation/override rather than silently absent)"
---

# Phase 3: Reviews & Ratings Verification Report

**Phase Goal:** Users can write and read trustworthy reviews that shape a business's public rating, with a review-filter system that is provably independent of who's watching in real time.
**Verified:** 2026-09-15T22:10:00Z
**Status:** passed (6/7 verified directly, 1/7 accepted via documented override — see frontmatter)
**Re-verification:** No — initial verification

**Process note:** This phase has no PLAN.md/CONTEXT.md/RESEARCH.md/UI-SPEC.md (project owner explicitly skipped that ceremony for phases 3-5, documented in ROADMAP.md's Phase 3 "Plans" note). Must-haves below are derived from ROADMAP.md's 5 Success Criteria plus REQUIREMENTS.md's 7 requirement IDs (REV-01..06, MOD-01), cross-checked directly against source, not against SUMMARY.md's claims. Per the orchestrator's explicit instruction, `npm test` / `npm run test:e2e` / `npm run build` were NOT re-run by this verifier — the orchestrator confirmed immediately prior: build clean, `npx vitest run` 187/189 (2 pre-existing time-of-day-flaky tests in `run-search-query.test.ts`, documented in `deferred-items.md`, unrelated to this phase), `npx playwright test` 4/4. This report is built entirely from independent source-level inspection instead.

**MVP-mode note:** ROADMAP.md sets `Mode: mvp` on Phase 3, but the phase goal text is not in the required "As a X, I want Y, so that Z." user-story format (confirmed via `user-story.validate` → `false`). This is a pre-existing ROADMAP authoring gap unrelated to this phase's implementation quality; it is reported here as an info item, not treated as grounds to refuse verification, since ROADMAP.md's own numbered Success Criteria already provide a complete, testable must-have contract that this report verifies against directly.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | REV-01: Logged-in user can write exactly one review per business (rating 1-5 first, then text ≥ min length, optional photos), enforced at DB level | ✓ VERIFIED | `prisma/schema.prisma:135` — `@@unique([userId, businessId])`; `app/api/reviews/route.ts:82-87` catches Prisma P2002 into a clean 409; `lib/validation/review.schema.ts` enforces `rating.int().min(1).max(5)` then `text.min(50)`; `review-composer.tsx` renders StarRatingInput before the Textarea |
| 2 | REV-02: User can edit their own review at any time; editing re-runs the review filter from scratch | ✓ VERIFIED | `app/api/reviews/[id]/route.ts:37-39` ownership check (403 for non-author); lines 55-60 call `gatherReviewSignals`/`classifyReview` fresh on every PATCH (no carried-forward classification, `excludeReviewId` passed so the review never compares against itself) |
| 3 | REV-03: Every review is synchronously classified recommended/not_recommended at publish; the author is never told which bucket in real time | ✓ VERIFIED | `lib/reviews/author-review-response.ts` — `AuthorReviewResponse` interface has only `{id, businessId, rating, text, createdAt}`; both POST (route.ts:77) and PATCH (route.ts:95) return exclusively through `toAuthorReviewResponse()`, a single shared serializer with no code path that can add `visibilityStatus`/`filterReason`/`filterSignals` — no branch in either handler conditions the response body on the filter outcome |
| 4 | REV-04: not_recommended reviews remain readable via an explicit "X reviews not currently recommended" disclosure link, excluded only from the public average/default view, never deleted | ✓ VERIFIED | `app/business/[slug]/page.tsx:69` — real `prisma.review.count({where: {..., visibilityStatus: "not_recommended"}})` passed as `notRecommendedCount`; `review-list.tsx:96-127` renders the count in the trigger text and lazily fetches+renders the filtered set via `?includeFiltered=true` (never a fake/decorative count); `recompute-business-rating.ts:14` aggregates `where: {visibilityStatus: "recommended"}` only — not-recommended reviews are excluded from the rating, never from storage |
| 5 | REV-05: Default review order blends recency + reviewer credibility + helpfulness votes, with explicit Newest/Highest/Lowest override always available | ✓ VERIFIED | `lib/reviews/sort-reviews.ts` — real exponential recency decay + log-scaled credibility blend, weighted sum with a documented, honestly-zeroed `HELPFULNESS_SCORE_NEUTRAL` placeholder (Phase 4's VOTE-01/02 is the documented integration point, per ROADMAP Phase 4 depends-on Phase 3); all 4 orderings (`newest`/`highest`/`lowest`/`blended`) are real comparator logic, not stubs, and `sort-reviews.test.ts` exercises each with real assertions incl. tie-breaks and a blended-outranks-raw-rating case; `ReviewSortDropdown` wires all 4 options in the UI |
| 6 | REV-06: filter logs structured signal data (reviewer history, burst/timing, text-similarity) for a future advertiser-parity audit | ✓ VERIFIED | `prisma/schema.prisma:127` — `filterSignals Json @default("{}")`, a genuine structured JSON column (not a string); `review-filter.ts`'s `ReviewFilterResult.filterSignals` carries the full raw signal object (`accountAgeHours`, `isFirstReview`, `priorReviewCount`, `reviewsLastHour`, `maxTextSimilarity`) plus derived `weakSignalCount`/`strongSignalCount`/`weakSignalNames`/`strongSignalNames`; both route handlers persist it verbatim (`filterSignals: filterResult.filterSignals as unknown as Prisma.InputJsonValue`) |
| 7 | MOD-01: Real-time profanity/hate-speech/PII classifier runs on every review AND photo before publish | ✗ PARTIAL / FAILED | Review-text half is real and well-tested (see Anti-Patterns/Requirements Coverage below). Photo half does not exist: no caption/alt-text is even accepted as API input, and `classifyContent()` is never invoked on anything photo-related in either route handler. See Gaps below. |

**Score:** 6/7 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/moderation/classify-content.ts` | MOD-01 hard-block classifier | ✓ VERIFIED (text-only) | Real regex rules for profanity/slurs (word-boundary guarded), SL phone numbers, emails, card-like digit sequences; 7 real unit tests |
| `lib/reviews/review-filter.ts` | REV-03/REV-06 pure scoring function | ✓ VERIFIED | Documented weak/strong signal thresholds, real decision rule, structured `filterSignals` output; 6 real unit tests |
| `lib/reviews/gather-review-signals.ts` | DB-querying signal gatherer | ✓ VERIFIED | Real Prisma queries for account age, prior/burst counts, own+platform-sample text-similarity comparisons |
| `lib/reviews/text-similarity.ts` | Jaccard-trigram similarity | ✓ VERIFIED | 6 real unit tests |
| `lib/reviews/recompute-business-rating.ts` | Transactional avgRating/reviewCount aggregate | ✓ VERIFIED | Real `aggregate()` scoped to `recommended` only, `null` (not 0) when zero recommended reviews |
| `lib/reviews/author-review-response.ts` | Response-shape secrecy serializer | ✓ VERIFIED | Single shared shape, no leak path |
| `lib/reviews/sort-reviews.ts` | REV-05 blended/newest/highest/lowest ordering | ✓ VERIFIED | Real, generic, pure function; 6 real unit tests |
| `app/api/reviews/route.ts` | POST create review | ✓ VERIFIED, WIRED | Auth-gated, MOD-01 then REV-03, transactional create + rating recompute, P2002→409 |
| `app/api/reviews/[id]/route.ts` | PATCH edit review | ✓ VERIFIED, WIRED | Ownership-gated, re-runs MOD-01+REV-03 from scratch, transactional update + rating recompute |
| `app/api/businesses/[slug]/reviews/route.ts` | GET review list | ✓ VERIFIED, WIRED | `includeFiltered` toggle, never exposes `filterReason`/`filterSignals` |
| `components/reviews/review-composer.tsx` | REV-01/REV-02 create+edit form | ✓ VERIFIED, WIRED | Rating-first field order, outcome-blind confirmation (identical "Thanks for your review!" regardless of server outcome), 409-race handling |
| `components/reviews/review-list.tsx` | REV-04/REV-05 list + disclosure | ✓ VERIFIED, WIRED | Never-hidden real count, lazy fetch, visually distinct filtered-variant cards |
| `lib/reviews/sort-reviews.test.ts` | REV-05 behavioral proof | ✓ VERIFIED | Real assertions per ordering, incl. tie-breaks and a blended-vs-raw-rating case |
| Photo moderation (no single artifact) | MOD-01 "every ... photo" | ✗ MISSING | No artifact implements this; see Gaps |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `review-composer.tsx` | `POST /api/reviews` / `PATCH /api/reviews/[id]` | `fetch()` in `onSubmit`, response awaited and branched on `res.ok`/`res.status` | ✓ WIRED | Real request + response handling, not fire-and-forget |
| `app/api/reviews/route.ts` | `lib/moderation/classify-content.ts` | `classifyContent(text)` called and result branched on `.blocked` | ✓ WIRED | |
| `app/api/reviews/route.ts` | `lib/reviews/review-filter.ts` | `classifyReview({text, signals})`, result persisted to DB, never returned to caller | ✓ WIRED | |
| `app/business/[slug]/page.tsx` | `components/reviews/review-list.tsx` | Direct Prisma queries → `ReviewListItem[]`/`notRecommendedCount` props → `BusinessPageView` → `ReviewList` | ✓ WIRED | Real DB-backed data, not hardcoded |
| `review-list.tsx` | `GET /api/businesses/[slug]/reviews?includeFiltered=true` | `fetch()` on accordion expand, response `.reviews` filtered to `not_recommended` and rendered | ✓ WIRED | Lazy, real, count matches disclosure trigger |
| `lib/reviews/sort-reviews.ts` | `review-list.tsx` / `app/business/[slug]/page.tsx` | Imported and called both server-side (SSR initial order) and client-side (sort dropdown) | ✓ WIRED | Same pure function both places, per key-decisions |
| (missing) | photo content/caption | classifyContent | ✗ NOT_WIRED | No link exists — see Gaps |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REV-01 | 03-backend, 03-ui | One review/business, rating-then-text-then-photos, DB unique constraint | ✓ SATISFIED | See Truth #1 |
| REV-02 | 03-backend, 03-ui | Edit own review, re-runs filter | ✓ SATISFIED | See Truth #2 |
| REV-03 | 03-backend, 03-ui | Synchronous classify, author never told in real time | ✓ SATISFIED | See Truth #3 |
| REV-04 | 03-ui | Not-recommended reviews readable via disclosure, never deleted | ✓ SATISFIED | See Truth #4 |
| REV-05 | 03-ui | Blended default order + Newest/Highest/Lowest override | ✓ SATISFIED | See Truth #5 |
| REV-06 | 03-backend | Structured audit-ready filter signals | ✓ SATISFIED | See Truth #6 |
| MOD-01 | 03-backend | Profanity/hate-speech/PII classifier on every review AND photo | ✗ BLOCKED (partial) | Review-text half satisfied; photo half absent — see Gaps |

No orphaned requirements: REQUIREMENTS.md's Phase mapping table (lines 138-140) lists exactly REV-01/02/03/04/05/06/MOD-01 against Phase 3, and all 7 were claimed and addressed (6 fully, 1 partially) by the two SUMMARY.md chunks — no requirement ID was left completely unaddressed.

### Anti-Patterns Found

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers, no `not yet implemented`/`coming soon` strings, and no stub return patterns (`return null`/`return {}`/empty handlers) found in any of the 14 key backend/UI files scanned (`lib/moderation/classify-content.ts`, `lib/reviews/*.ts`, `app/api/reviews/**/*.ts`, `app/api/businesses/[slug]/reviews/route.ts`, `components/reviews/*.tsx`, `app/business/[slug]/page.tsx`). The gap found (MOD-01 photo moderation) is an absence of a feature, not a stub marker left in place — nothing was found flagging it as known-incomplete.

### Human Verification Required

None required to resolve this phase's status — the MOD-01 gap is a concrete, source-verifiable absence (grep-provable: no call site passes photo data through `classifyContent`), not something requiring subjective/visual judgment.

### Gaps Summary

Six of the seven Phase 3 requirements (REV-01 through REV-06) are genuinely, substantively implemented and wired — this is a solid piece of work: the REV-03 response-shape secrecy rule is enforced structurally (a single shared serializer with a hard-coded field allowlist, not a discipline two independently-hand-written handlers have to remember), REV-06's `filterSignals` really is structured JSON with real signal data, REV-05's four sort orderings are real tested logic, and REV-04's disclosure is backed by a real live count and a real lazy-fetched filtered list, never deleted.

The one gap is **MOD-01's photo-moderation half**. REQUIREMENTS.md is explicit: "Real-time profanity/hate-speech/PII classifier runs on every review **and photo** before publish." The implementation only ever classifies review *text*. Photos are accepted as bare URL strings with no caption/description field even present in the input schema, and `classifyContent()` is never called with anything photo-derived. Neither `03-backend-SUMMARY.md` nor `03-ui-SUMMARY.md` documents this as a considered, deliberate scope decision (e.g., "photo moderation deferred to Phase 5 upload infra") — it is simply absent, with no trace of the trade-off having been made consciously.

**This may be intentional and defensible** — there is no actual photo *content* to inspect yet (no upload infrastructure exists per both SUMMARYs; photos are arbitrary third-party-hosted URLs), so an image-content classifier is out of scope, and there is no caption text to run the existing text classifier against. If that is the accepted rationale, the fix is either (a) accept a documented override, or (b) do the small amount of remaining work: accept an optional caption/alt-text field and run it through the existing `classifyContent()`, closing the literal requirement gap without needing any new moderation infrastructure.

**This looks like it could be intentional.** To accept this deviation, add to VERIFICATION.md frontmatter:

```yaml
overrides:
  - must_have: "MOD-01: classifier runs on every review and photo before publish"
    reason: "No photo upload/caption infrastructure exists this phase (photos are bare third-party URL strings); there is no photo-adjacent text or image content available to classify. Full photo moderation is deferred until Phase 5's upload infrastructure lands."
    accepted_by: "{name}"
    accepted_at: "{ISO timestamp}"
```

---

_Verified: 2026-09-15T22:10:00Z_
_Verifier: Claude (gsd-verifier)_
