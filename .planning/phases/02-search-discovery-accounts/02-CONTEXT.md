# Phase 2: Search, Discovery & Accounts - Context

**Gathered:** 2026-09-13
**Status:** Ready for planning
**Source:** Autonomous smart-discuss (batch proposals auto-accepted per user's explicit
"full autonomous, pick sensible defaults" instruction — not individually re-confirmed
per area; summarized for the user after the fact instead)

<domain>
## Phase Boundary

Users can find businesses in the Phase-1 seeded directory (107 businesses) through
search, filters, and ranking, and can browse entirely as guests, signing up only when
they choose to. This phase delivers: free-text + geo search, filters (category/price/
open-now/distance/rating/attributes), 4 sort options, home discovery rails, phone-OTP
auth (guest browsing preserved), and `language_pref` + switcher scaffolding (English
complete, Sinhala/Tamil structural only — no translated strings yet). Reviews, ratings,
Q&A, photos-by-users, collections, and business claim/ads are explicitly out of this
phase (Phases 3-5).

</domain>

<decisions>
## Implementation Decisions

### Search Technology
- **D-01:** Use Postgres native full-text search (`tsvector`/`GIN` index, trigram
  extension for fuzzy match) for Phase 2, NOT a standalone OpenSearch/Elasticsearch
  cluster. The original spec's Section 14 names OpenSearch as the long-term target, but
  at ~107 seeded businesses, standing up a separate search cluster now violates the
  bootstrap-budget constraint (PROJECT.md Constraints) for negligible benefit — the same
  "don't build infrastructure before real data volume" logic the spec itself applies to
  ML ranking models (spec 6.1) applies here. Structure the ranking query
  (relevance + geo-decay + rating-adjustment terms) so a future migration to OpenSearch
  is a swap of the query layer, not a data-model rewrite.
- **D-02:** "Recommended" sort's rating-adjustment term (Bayesian/Wilson-score) has no
  real rating data to operate on yet — reviews don't exist until Phase 3. Implement the
  ranking formula's structure now (relevance + geo-decay + a rating term) but the rating
  term contributes a neutral/zero weight for every business until Phase 3 introduces
  real `avg_rating`/`review_count` data. Do NOT fabricate placeholder ratings to make the
  formula "feel complete" — an honest neutral term is correct, fake data is not.

### Auth & Sessions
- **D-03:** Phone-OTP flow is fully implemented (generation, verification, session
  issuance) but the "send SMS" transport is a dev-mode stub (e.g. logs the OTP to the
  server console/response in non-production) behind a clean transport interface —
  no real SMS provider (Notify.lk/Dialog per spec Section 15) is wired or paid for in
  this phase, consistent with the bootstrap-budget constraint. Swapping in a real
  provider later should only require implementing that one interface.
- **D-04:** Session mechanism is httpOnly cookie-based (not client-stored JWT in
  localStorage), implemented directly rather than pulling in a heavy full-featured auth
  framework — Phase 2's auth surface (phone OTP + optional email, no OAuth yet) doesn't
  justify a framework dependency yet. Revisit if Phase 2's service-business features add
  OAuth/social login later.
- **D-05:** Guest browsing remains fully unrestricted in Phase 2 (search, browse, view
  business pages — all work with zero login prompts). No feature in Phase 2 actually
  *requires* login yet (reviews/messages/bookmarks are later phases) — Phase 2 ships the
  auth flow itself (signup/login/logout, session persistence, visible logged-in state in
  the header) as forward infrastructure for Phase 3+, not because anything in Phase 2
  gates on it.
- **D-06:** Progressive profile (AUTH-03) means: phone number + OTP is the only required
  field to complete signup. Display name/avatar/bio are optional and can be added later
  from a profile page (which this phase does not need to build in full — a minimal
  "set your name" prompt post-signup is sufficient).

### Localization Scaffolding
- **D-07:** `language_pref` (en|si|ta) is stored on the user account for logged-in users
  and in a cookie for guests, with a switcher visible in the header. Selecting Sinhala or
  Tamil in Phase 2 only persists the preference — it does NOT trigger any translated UI
  strings (English remains the only complete language per LOC-01's own wording). Do not
  scope-creep into building an i18n string-translation pipeline this phase.

### Filter & Sort UI
- **D-08:** Filter controls use a bottom-sheet/drawer pattern on mobile and an inline
  sidebar on desktop — a standard, well-established responsive pattern consistent with
  Phase 1's mobile-first UI-SPEC precedent. No alternative was seriously considered; this
  is implementation detail, not a product decision worth belaboring.

### Claude's Discretion
- Exact Postgres full-text search configuration (`tsvector` column generation strategy —
  generated column vs trigger vs application-level maintenance), geo-decay formula
  specifics, and how filters compose into a single Prisma/SQL query are left to
  research/planning.
- Exact OTP code format/length/expiry, and whether email/password is offered as a
  parallel path in Phase 2 or deferred, are left to research/planning discretion within
  AUTH-01's "phone OTP primary, email optional" wording.
- Home discovery rail selection logic (what counts as "trending near you" / "new
  businesses" with no view/click telemetry yet from Phase 1) is left to planning —
  likely simple heuristics (recently added, random-but-stable sample) rather than real
  trending signals, since no usage data exists yet.

### Post-Research Resolutions (from 02-RESEARCH.md Open Questions)
- **D-09:** The home page does NOT ship a "Top Rated" rail in Phase 2. Extending D-02's
  "don't fabricate ratings" principle to this surface too: with zero real reviews/ratings
  in the data model until Phase 3, a "Top Rated" rail could only be driven by fake or
  arbitrary data, which is the same honesty violation D-02 already ruled out for search
  ranking. ROADMAP SC4's rail list ("such as trending nearby, top rated this month, new
  businesses, category shortcuts") is illustrative, not a strict checklist — ship
  Trending Nearby (stable-random sample), New Businesses (by `createdAt`), and Category
  Shortcuts (from the taxonomy) instead. Revisit "Top Rated" once Phase 3 ships real
  ratings.
- **D-10:** "Where" search supports both a typed district-name lookup (static
  district→centroid table, no new dependency) and the browser Geolocation API — accept
  RESEARCH.md's recommendation as-is.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — vision, constraints (bootstrap budget, Node/TS stack), Key
  Decisions table (now includes Phase 1 outcomes)
- `.planning/REQUIREMENTS.md` — SRCH-01 through SRCH-06, AUTH-01 through AUTH-03, LOC-01
  are this phase's requirements; `## v1 Requirements > Search & Discovery` and `> Auth`
  sections
- `.planning/ROADMAP.md` — Phase 2 section for the authoritative goal statement and
  success criteria
- `.planning/phases/01-business-directory-foundation/01-RESEARCH.md` — Phase 1's stack
  research (Prisma 7 + `@prisma/adapter-pg` driver adapter requirement, Next.js 16 App
  Router conventions) still applies; do not re-research the base stack
- `.planning/phases/01-business-directory-foundation/01-VERIFICATION.md` — confirms what
  actually shipped in Phase 1 (107 businesses, category taxonomy, hours/attributes) that
  Phase 2's search indexes/filters over

No other external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/prisma.ts` — Prisma client singleton with `@prisma/adapter-pg` driver adapter;
  reuse directly for any new query code, do not reinstantiate
- `lib/categories/category-config.ts` — full 16-leaf category taxonomy + per-category
  attribute Zod schemas; the category filter UI/query should read from this, not
  duplicate the list
- `components/ui/*` (shadcn primitives: badge, button, card, tabs, accordion,
  aspect-ratio, breadcrumb, separator, skeleton) — reuse for new UI (e.g. filter drawer,
  search bar, sort dropdown) rather than introducing new component patterns
- `components/directory/business-card.tsx` — existing card rendering for a business in
  list context; search results should likely reuse or extend this rather than building a
  parallel card component
- `app/directory/page.tsx` — existing category-grouped, paginated directory index;
  search results page is a sibling/evolution of this pattern (same `take`/`skip`
  pagination approach)
- `components/business/business-map.tsx` (+ `business-map-dynamic.tsx` for
  Next.js dynamic import / SSR-safety) — Leaflet map pattern already established; reuse
  for a search-results map view rather than introducing a second map library

### Established Patterns
- Server Components fetch directly via Prisma in the page component (`app/business/
  [slug]/page.tsx`, `app/directory/page.tsx`) — no separate API route layer exists yet.
  Follow this pattern for search unless the search/filter interaction genuinely needs a
  client-side fetch (e.g. live filter updates without full page reload), in which case a
  Route Handler under `app/api/` is the natural addition.
- Zod `.strict()` schemas for all validated input (`lib/validation/business.schema.ts`,
  `lib/hours/hours.schema.ts`) — follow this convention for OTP request/verify payloads
  and any new form input.
- Vitest + Testing Library for unit/component tests, Playwright for e2e smoke —
  established in Phase 1, `01-VALIDATION.md`'s locked-test-map pattern should be mirrored
  for Phase 2's own VALIDATION.md.

### Integration Points
- `app/layout.tsx` — root layout; header/nav (login state, language switcher) integrates
  here
- `prisma/schema.prisma` — new models needed: `User` (phone, OTP fields or a separate
  `OtpChallenge` table, `language_pref`, session-related fields) — extends the existing
  Business/BusinessHours/BusinessHoursOverride/BusinessPhoto schema, does not replace it
- `app/directory/page.tsx` likely evolves into or is joined by a new `/search` route per
  the spec's IA (Section 4: `/search?find_desc=&find_loc=`)

</code_context>

<specifics>
## Specific Ideas

No particular UI references beyond what's already locked in Phase 1's UI-SPEC precedent
(shadcn, mobile-first, 8-point spacing, orange accent reserved for primary actions). A
new `02-UI-SPEC.md` should extend that same design system rather than introducing a new
visual language.

</specifics>

<deferred>
## Deferred Ideas

- Real trending/personalization signals for home discovery rails — no usage telemetry
  exists yet; Phase 2 uses simple heuristics instead. Revisit once real traffic exists
  (spec 6.4, explicitly a post-MVP concern).
- OpenSearch/Elasticsearch migration — deferred until real query volume justifies the
  infra cost (D-01 above).
- Real SMS provider integration (Notify.lk/Dialog) — deferred past Phase 2's dev-stub
  OTP transport (D-03) until there's a reason to pay for it (e.g. approaching a real
  user-facing launch).
- Full i18n string translation for Sinhala/Tamil — deferred past the `language_pref`
  scaffolding (D-07); this is a substantial content-translation effort suited to its own
  future phase, not a Phase 2 side-quest.
- Full profile page (avatar upload, bio editing) — deferred past the minimal
  progressive-profile prompt (D-06); a fuller profile page is more naturally tied to
  Phase 5's user-facing collections/reviewer-profile work.

### Reviewed Todos (not folded)
None — no pending todos existed for this phase.

</deferred>

---

*Phase: 2-Search, Discovery & Accounts*
*Context gathered: 2026-09-13*
