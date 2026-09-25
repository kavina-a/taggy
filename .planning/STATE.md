---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Yelp Parity Redesign
current_phase: 6
current_phase_name: Data Foundation
status: executing
stopped_at: Completed 06-01-PLAN.md
last_updated: "2026-09-25T05:47:50.764Z"
last_activity: 2026-09-25
last_activity_desc: Phase 6 execution started
progress:
  total_phases: 10
  completed_phases: 0
  total_plans: 7
  completed_plans: 1
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-24)

**Core value:** The free consumer review/search product must stay trustworthy and useful —
that trust is the asset every business-side revenue stream is sold against.
**Current focus:** Phase 6 — Data Foundation

## Current Position

Phase: 6 (Data Foundation) — EXECUTING
Plan: 2 of 7
Status: Ready to execute
Last activity: 2026-09-25 — Phase 6 execution started
System, Home & Search, Business Page & Write a Review, Login/Signup/Claim); REQUIREMENTS.md
traceability updated; 37/37 v2.0 requirements mapped

Progress: [█████░░░░░] 50% (5 of 10 phases complete across both milestones; 0 of 5 v2.0 phases complete)

## Performance Metrics

**Velocity:**

- Total plans completed: 18
- Average duration: N/A
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 5 | - | - |
| 2 | 9 | - | - |
| 3 | 2 | - | - |
| 4 | 1 | - | - |
| 5 | 1 | - | - |
| 6 | - (TBD) | - | - |
| 7 | - (TBD) | - | - |
| 8 | - (TBD) | - | - |
| 9 | - (TBD) | - | - |
| 10 | - (TBD) | - | - |

**Recent Trend:**

- Last 5 plans: N/A
- Trend: N/A

*Updated after each plan completion*
| Phase 01 P01 | 35min | 3 tasks | 141 files |
| Phase 01 P02 | 15min | 3 tasks | 16 files |
| Phase 01 P03 | 11min | 3 tasks | 13 files |
| Phase 01 P04 | 25min | 3 tasks | 6 files |
| Phase 01 P05 | 15min | 2 tasks | 3 files |
| Phase 02-search-discovery-accounts P01 | 42min | 3 tasks | 18 files |
| Phase 02-search-discovery-accounts P02 | 26min | 3 tasks | 6 files |
| Phase 02-search-discovery-accounts P03 | 15min | 2 tasks | 8 files |
| Phase 02-search-discovery-accounts P04 | 9min | 3 tasks | 6 files |
| Phase 02-search-discovery-accounts P05 | 10min | 2 tasks | 8 files |
| Phase 02-search-discovery-accounts P06 | 12min | 2 tasks | 5 files |
| Phase 02-search-discovery-accounts P07 | 7min | 2 tasks | 4 files |
| Phase 02 P08 | 22min | 3 tasks | 22 files |
| Phase 02-search-discovery-accounts P09 | 8min | 2 tasks | 3 files |
| Phase 03-reviews-ratings P01 (backend) | 25min | 8 commits | 22 files |
| Phase 03-reviews-ratings P02 (ui) | 19min | 17 commits | 21 files |
| Phase 04-voting-owner-response-reporting (implementation) | — | 1 chunk | schema + APIs + UI + e2e |
| Phase 05-rich-content-photos-qa-collections (implementation) | — | 1 chunk | schema + APIs + UI + e2e |
| Phase 06-data-foundation P01 | 12min | 3 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Phase 1 (Consumer MVP) split into 5 vertical slices — directory foundation,
  search+accounts, reviews, voting/owner-response/reporting, then photos/Q&A/collections —
  instead of horizontal layers, per PROJECT_MODE=mvp.

- Roadmap: LOC-01 (language_pref + switcher) mapped to Phase 2 (Accounts) rather than Phase 1
  (Directory) since it's an account/UI concern, not listing data.

- Roadmap: MOD-01 (real-time content classifier) mapped to Phase 3 (Reviews) since that's the
  first UGC surface it protects; MOD-02 (report/flag) mapped to Phase 4 alongside owner
  claim/response since that's when the first non-review-author trust actions appear.

- Roadmap (v2.0): The user pre-agreed the 5-phase Yelp Parity Redesign structure before
  roadmapping — Data Foundation (6) → Design System (7) → Home & Search (8) → Business Page/
  Reviews-Photos-QA Restyle & Write a Review (9) → Login/Signup/Claim (10), sequential
  dependency chain, no reshuffling by the roadmapper. Numbering continues from Phase 5 (the
  prior milestone's last phase) rather than restarting at 1.

- Roadmap (v2.0): Design System (Phase 7) explicitly depends on Data Foundation (Phase 6)
  completing first, per the user's explicit instruction — components need real seeded data to
  build/preview against, not fixture/placeholder data.

- Roadmap (v2.0): Phase 9 must build/verify the business page as a normal full page at
  `/business/[slug]` before attempting the intercepted-route modal-over-search variant; the
  modal variant is the last task in that phase's plan, not an early one.

- Roadmap (v2.0): LOGINUI-03 (Google OAuth) is explicitly optional/stretch within Phase 10 —
  add only if low-effort; Apple sign-in is out of scope entirely for this milestone.

- [Phase 01]: Used shadcn's Vega preset (Radix, neutral, Inter, lucide-react) since shadcn CLI 4.21.0 replaced the old style/base-color prompts with named presets — Vega matches UI-SPEC's Inter + lucide-react + neutral requirements exactly.
- [Phase 01]: Adopted Prisma 7's required @prisma/adapter-pg driver adapter and custom client output path since Prisma 7.10.0 removed the bundled Rust query engine and no longer generates into node_modules/@prisma/client by default.
- [Phase 01]: Pinned docker-compose.yml's db service to platform: linux/amd64 since postgis/postgis publishes no arm64 manifest on any checked tag; kept the RESEARCH-approved image rather than switching to an unvetted alternative.
- [Phase 01]: Extended businessSeedSchema (.strict()) with hours/hoursOverrides array fields validated via hoursRowSchema/hoursOverrideRowSchema, implementing threat T-02-01.
- [Phase 01]: Used Ministry of Crab's Friday dinner shift (18:30-02:00, crossesMidnight) as the seeded midnight-crossing example and Upali's by Nawaloka's Dec-25 override as the seeded holiday-closure example.
- [Phase ?]: [Phase 01, Plan 03]: Copied restaurant/home-services/beauty-spa attribute schemas verbatim from 01-RESEARCH.md's Pattern 3 example; fixed 01-01/01-02's placeholder category slugs (cafe -> cafe-bakery, vehicle-repair -> auto-repair) and replaced generic attributes with category-correct shapes as instructed by the plan's Task 3.
- [Phase ?]: [Phase 01, Plan 03]: AttributeBadges skips enum fields left at a non-informative default (none/all/other) rather than always rendering a badge for every set field.
- [Phase 01]: Distributed 94 new seed businesses across all 16 leaf categories (restaurant largest at 20, every other leaf >= 5) rather than an even split, per CONTEXT.md D-04's discretion note.
- [Phase 01]: Implemented directory pagination as one global take/skip Prisma query (fixed 24/page, driven only by ?page=), then grouped that page's results in-memory by category-taxonomy group — not a separate paginated query per group.
- [Phase ?]: [Phase 01-05]: Included the shadcn breadcrumb gap-closure fix in the same plan as the blocking secondaryCategories render fix, since it reuses only existing static taxonomy data in the same file. — Small, presentational, same-file addition; avoids reopening the phase for a separate deferred plan.
- [Phase ?]: [Phase 02, Plan 01]: Removed Prisma's auto-generated DROP INDEX on Business_location_gist from the add_search_and_auth migration scaffold, since Prisma's diff treats the hand-added GiST index as unmanaged drift and would have deleted it, regressing Phase 2's geo-decay search ranking
- [Phase ?]: [Phase 02, Plan 01]: Added dotenv/config to vitest.setup.ts (global test setup) so process.env secrets from .env (OTP_HMAC_SECRET, SESSION_SECRET) resolve inside Vitest, matching the existing dotenv/config pattern in lib/prisma.ts and prisma7.config.ts
- [Phase ?]: [Phase 02, Plan 02]: Test fixtures for run-search-query.test.ts use invented category slugs/query words (e.g. zzztest-restaurant-cat, bravinoxa, vexonflorp) isolated from the real 107-row seed dataset, self-cleaning via a test-search-* slug prefix
- [Phase ?]: [Phase 02, Plan 02]: Open-now integration test fixtures anchored to the real Asia/Colombo clock at fixture-creation time (multi-hour safety margins) since SearchFilters' locked contract has no now-override param
- [Phase ?]: [Phase 02, Plan 02]: Implemented radiusKm (SRCH-03 distance-radius filter) via ST_DWithin even though not individually enumerated in the plan's behavior list, since it is part of the exported SearchFilters contract 02-04/02-08 will import directly
- [Phase ?]: [Phase 02, Plan 03]: Verify route does not re-normalize the incoming phone with libphonenumber-js -- the plan's contract only specifies that normalization step for the send route (E.164 normalization authority); client resubmits the same phone string the send flow returned/normalized
- [Phase ?]: [Phase 02, Plan 04]: BusinessCard's new search-context metadata block only renders when hasSearchContext is true (at least one new optional prop passed), reconciling 'renders exactly as before' vs 'reviewCount undefined renders No reviews yet' without contradiction
- [Phase ?]: [Phase 02, Plan 04]: Used @testing-library/react's fireEvent instead of installing @testing-library/user-event (not in 02-RESEARCH.md's audited package list) for SearchBar tests
- [Phase ?]: [Phase 02, Plan 05]: OtpEntryForm owns its resend logic directly (calls /api/auth/otp/send itself, manages its own cooldown) instead of a parent-threaded resend callback
- [Phase ?]: [Phase 02, Plan 05]: ProgressiveProfileDialog's Skip for now renders as an accessible role=link (anchor + preventDefault) matching UI-SPEC's 'text link, equal visual weight' description literally
- [Phase ?]: [Phase 02, Plan 06]: POST /api/auth/logout redirects a plain form-POST submission back to / (303) instead of always returning bare JSON, so the header's no-JS logout control actually returns the user to guest browsing instead of stranding them on a raw JSON page; a fetch caller still gets the plan's literal {ok:true}
- [Phase ?]: [Phase 02, Plan 06]: Interactive header controls (select/dropdown-menu/avatar) are composed directly inside the Server Component app/layout.tsx without a client wrapper, since those shadcn primitives are already 'use client' at the file level and no function prop crosses the server/client boundary; logout uses a plain <form> submit button instead of an onClick handler
- [Phase ?]: [Phase 02, Plan 07]: DiscoveryRail's condensed card is a private inline RailCard render, not a reuse of BusinessCard's own output, since BusinessCard's hasSearchContext gating leaks a 'No reviews yet' line whenever priceTier/distanceKm/openNow is passed, which the one-metadata-line condensed-card spec excludes
- [Phase ?]: [Phase 02, Plan 07]: Trending Near You uses a stable SHA-256 hash of businessId+"trending-v1" (Node crypto, no new dependency) instead of Math.random(), so the sample is identical across requests/dev-restarts
- [Phase 2]: Category-conditional attribute filters use a single fixed 'attrs' URL query key (key:true,key2:true) since search-params.schema.ts's .strict() schema can't enumerate category-dependent attribute keys ahead of time
- [Phase 2]: URL updates during filter/sort changes use raw history.replaceState instead of next/navigation's router.replace, avoiding a full Server Component RSC round-trip on every filter tap
- [Phase 2]: getBooleanAttributeFields derives a category's boolean-typed attribute keys via schema.partial().safeParse({}) rather than reaching into Zod internals, since several category schemas have a required non-defaulted priceTier field
- [Phase ?]: [Phase 2, Plan 09]: e2e/guest-browsing.spec.ts uses one sequential test visiting all 5 guest-facing URLs in a single fresh Playwright context, matching the plan's literal wording, rather than 5 independent isolated tests
- [Phase ?]: [Phase 2, Plan 09]: Fixed app/login/page.tsx to call router.refresh() after router.push post-login/post-profile-dismiss, since Next.js's client Router Cache kept the session-aware header stale on the already-visited home route -- caught by the new cross-cutting e2e smoke test
- [Phase 3]: Executed the Phase 3 backend chunk directly from ROADMAP.md/REQUIREMENTS.md, skipping the discuss/research/plan-checker ceremony per the user's explicit 2026-09-15 instruction (logged in PROJECT.md Key Decisions) — no upstream PLAN.md/CONTEXT.md/RESEARCH.md artifacts exist for this chunk, only this SUMMARY.
- [Phase 3, backend]: Combined 'new account (<24h)' and 'first-ever review' into ONE weak signal (low_reviewer_history) in the REV-03 filter engine, not two, so a genuinely new user's honest first review isn't automatically filtered on its own.
- [Phase 3, backend]: Review filter decision rule: 1+ strong signal (text similarity >0.8) OR 2+ weak signals (low reviewer history, burst-posting >3/hour) tips a review to not_recommended.
- [Phase 3, backend]: Replaced run-search-query.ts's RATING_SCORE_NEUTRAL placeholder with a Bayesian-shrunk rating term (5 phantom reviews at the same neutral prior) rather than a naive avgRating/5, to satisfy SRCH-05's already-validated 'never a naive average' requirement now that real rating data exists.
- [Phase 3, backend]: Hand-edited the add_reviews migration to drop Prisma's auto-generated DROP INDEX (Business_location_gist, business_name_trgm_idx) and invalid DROP DEFAULT (on the generated searchable tsvector column) statements — third occurrence of this exact migration-safety trap after 01-01 and 02-01.
- [Phase 3, backend]: 50-character minimum review text length, matching REQUIREMENTS.md's own literal wording.
- [Phase 3, ui]: Extended GET /api/businesses/[slug]/reviews with userAccountCreatedAt/userReviewCount so REV-05's blended sort has real reviewer-credibility inputs; still never exposes filterReason/filterSignals.
- [Phase 3, ui]: lib/reviews/sort-reviews.ts's blend = exponential recency decay (30-day half-life) + log-scaled credibility (account age capped 1yr, review count capped ~10) + a weighted-but-zeroed HELPFULNESS_SCORE_NEUTRAL placeholder — Phase 4's VOTE-01/02 only needs to replace that one constant, never re-tune the other weights.
- [Phase 3, ui]: Review photos render via a plain <img>, not next/image, since next.config.ts's images.remotePatterns is deliberately restricted to picsum.photos only (T-03-02) and review photo URLs are arbitrary reviewer-supplied strings (no upload infra yet).
- [Phase 3, ui]: ReviewComposer's existing-review state starts collapsed behind an "Edit your review" button; a review card's own "Edit" link is a same-page anchor (#write-a-review) to that single composer instance, since REV-01's one-review-per-user-per-business constraint means there's only ever one editable review per user per business.
- [Phase 4]: Executed directly from ROADMAP.md/REQUIREMENTS.md, skipping discuss/research/plan-checker, matching Phase 3's 2026-09-15 instruction.
- [Phase 4]: OtpChallenge.purpose namespaces login vs claim so proving control of a listing number cannot sign you in as that number.
- [Phase 4]: Vote auth = any logged-in account except self-vote; no review-history gate.
- [Phase 4]: computeHelpfulnessScore weights Useful=1.0, Funny/Cool=0.5, log-scaled and capped at 1.0 — replaces HELPFULNESS_SCORE_NEUTRAL without retuning recency/credibility.
- [Phase 4]: toReporterConfirmation() always returns {ok:true}; duplicate reports upsert silently so a reporter cannot probe prior-report status.
- [Phase 4]: Seed listed phones derived from slug hash in seed.ts, not added to the 107-row JSON.
- [Phase 4]: Fourth Prisma migrate trap — stripped DROP INDEX on Business_location_gist / business_name_trgm_idx and searchable DROP DEFAULT before migrate deploy.
- [Phase 5]: Executed directly from ROADMAP.md/REQUIREMENTS.md, skipping discuss/research/plan-checker.
- [Phase 5]: Community photos stored as same-origin /uploads/{id}.ext — did not widen next.config images.remotePatterns.
- [Phase 5]: classifyPhoto is a hard pre-insert gate (format, size, min 200px, max 4:1 aspect, NSFW lexical, classifyContent on caption).
- [Phase 5]: One default collection per user via partial unique SQL index; name is the literal "My Saved Places".
- [Phase 5]: Fifth Prisma migrate trap — same gist/trgm DROP INDEX + searchable DROP DEFAULT strip.
- [Post-MVP leftovers]: Top Rated rail, review file uploads, pixel NSFW scan, optional email, si/ta chrome strings, people-also-viewed, Consumer Alert slot, owner listing editor, /moderation queue.
- [Phase ?]: [Phase 06, Plan 01]: BusinessPhoto.tag/ReviewPhoto.tag kept nullable (PhotoTag?) at the DB level per the plan's literal type spec, even though prose called BusinessPhoto.tag 'required' -- 06-07 fulfills that as an application-level seeding guarantee, not a schema constraint
- [Phase ?]: [Phase 06, Plan 01]: Sixth occurrence of the Prisma migrate-dev DROP INDEX/DROP DEFAULT trap on Business.location/searchable -- stripped before applying, documented in migration header comment

### Pending Todos

- Migrating ReviewCard photos to next/image is still blocked for arbitrary third-party URLs (T-03-02). Same-origin `/uploads` thumbs are fine.
- Local seed/e2e may have claimed directory listings and created public "My Saved Places" rows. Re-seed if you need a clean claim/collection demo.
- Full BIZ-01/BIZ-02 owner dashboard (analytics, BR documents) remains v2. TRUST-01 two-person moderation remains v2 — `/moderation` is a single-moderator inbox.
- Next action: run `/gsd-plan-phase 6` to begin planning Data Foundation (v2.0's first phase).

### Blockers/Concerns

- REQUIREMENTS.md's original coverage table stated "30 total" v1 requirements; the actual
  count of individually-listed requirement IDs is 33. Corrected during roadmap traceability
  update — all 33 are mapped 1:1 to a phase.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none — first milestone)* | | | |

## Session Continuity

Last session: 2026-09-25T05:47:50.756Z
Stopped at: Completed 06-01-PLAN.md
traceability updated with all 37 v2.0 requirement mappings; ready to plan Phase 6.
Resume file: None
