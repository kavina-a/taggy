# Phase 1: Business Directory Foundation - Context

**Gathered:** 2026-09-13
**Status:** Ready for planning

<domain>
## Phase Boundary

A real, structured, browsable directory of Colombo businesses. This phase delivers the
data model and web UI for a business listing (categories, address, hours, category-
conditional attributes, photo gallery, restaurant menu tab as photos) plus a seeded
starter dataset of real Colombo businesses — nothing else. No search/filtering (Phase 2),
no reviews (Phase 3), no owner claim/response (Phase 4), no photo uploads by users or
Q&A/collections (Phase 5). "Browsable" here means a user can navigate directly to and
view a business profile page; ranked/filtered discovery is explicitly out of this phase.

</domain>

<decisions>
## Implementation Decisions

### Platform Surface
- **D-01:** Phase 1 ships web only. React Native mobile app is deferred to a later
  phase, once the API this phase establishes is stable. (Backend stack is still
  Node.js/TypeScript per PROJECT.md; specific web framework choice, e.g. Next.js, is
  left to the phase researcher/planner to recommend — not locked by the user.)

### Category Attributes
- **D-02:** Business attributes are stored as a single flexible `jsonb` column on
  `businesses`, not fixed typed columns. A small per-category config (table or static
  config file) defines which attribute keys/types are valid/expected for each category,
  so adding a new attribute or category later doesn't require a schema migration.

### Menu Representation
- **D-03:** For v1, a restaurant's "menu tab" is a pinned photo gallery only (per LIST-04's
  literal wording) — no structured `MenuItem` (name/price/description) entity yet. The
  spec's full data model includes a MenuItem entity, but real seed data for it is sparse
  (most Colombo restaurants don't have digitized menus), so it's explicitly deferred.
  Do not build MenuItem tables/relations in this phase.

### Seed Data Sourcing
- **D-04:** The Colombo starter dataset (LIST-06) is manually curated — hand-compiled,
  not scraped or pulled from OpenStreetMap. Target ~100-300 real, well-known Colombo
  businesses spanning the seeded category taxonomy (LIST-05), including the
  locally-distinct categories (tuk repair, tutoring, wedding vendors, tailoring). No
  ToS/scraping risk this way, and it's "good enough" to avoid an empty directory at
  first use — this is explicitly a stopgap per spec Phase 0, not a data-quality bar to
  over-invest in.

### Claude's Discretion
- Exact web framework (Next.js vs. alternatives), ORM/query layer choice, and how the
  per-category attribute config is physically stored (JSON config file vs. a
  `category_attributes` table) are left to research/planning — the user did not express
  a preference beyond "Node.js/TypeScript backend."
- Exact seed dataset size within the ~100-300 range and which specific businesses to
  include are Claude's discretion, guided by covering the full category taxonomy rather
  than clustering in one vertical (e.g. don't seed 200 restaurants and 5 everything else).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — full project vision, constraints (bootstrap budget, Node/TS +
  React Native stack), and Key Decisions (review-filter secrecy, ad/organic separation —
  not yet relevant to Phase 1, but establishes precedent for how trust-sensitive systems
  in this product should be built)
- `.planning/REQUIREMENTS.md` — LIST-01 through LIST-06 and LOC-02 are this phase's
  requirements; `## v1 Requirements > Listings` section
- `.planning/ROADMAP.md` — Phase 1 section (`### Phase 1: Business Directory Foundation`)
  for the authoritative goal statement and success criteria

### Original spec (embedded in PROJECT.md, not a standalone file)
No standalone spec file exists — the full original build specification was supplied
inline during project initialization and its relevant content (data model field lists,
category taxonomy, attribute schema examples) was folded into PROJECT.md's Context
section and REQUIREMENTS.md. Specifically relevant excerpts a planner should treat as
authoritative:
- Appendix A category taxonomy (top-level groups + Sri Lanka-specific additions:
  Tuition/Tutoring, Three-Wheeler & Vehicle Repair, Wedding & Event Vendors,
  Tailoring/Garments) — informs LIST-05
- Appendix B example attribute schemas (Restaurants: delivery/takeout/dine-in/outdoor
  seating/good for groups/good for kids/alcohol served/reservations accepted/price
  tier/parking/wifi; Home Services: license verified/free estimates/emergency service/
  years in business/service area radius; Beauty & Spas: walk-ins welcome/appointment
  required/gender-specific services/price tier) — informs LIST-03's jsonb schema design

No external specs beyond the above — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

Greenfield project — no source code exists yet (repo contains only `.planning/` and
`.claude/` at this point). No reusable assets, established patterns, or integration
points to note. This is the first phase; it establishes the patterns later phases will
follow.

</code_context>

<specifics>
## Specific Ideas

No particular UI references or "I want it like X" moments — user deferred implementation
specifics (web framework, exact seed list) to Claude's discretion. The main specific
constraints carried forward are: bootstrap/minimize-cost infra (PROJECT.md Constraints),
and the jsonb-attributes / photos-only-menu / manually-curated-seed decisions above.

</specifics>

<deferred>
## Deferred Ideas

- React Native mobile app — explicitly deferred past Phase 1 (Platform Surface decision
  above); revisit once the Phase 1/2 API is stable.
- Structured `MenuItem` entity (name/price/description) — deferred past v1 per Menu
  Representation decision; likely candidate for a future business-dashboard phase (menu
  editing is listed under Phase 2's business platform work in REQUIREMENTS.md v2).
- OpenStreetMap-based or scraped seed data pipeline — not chosen for Phase 1, but could
  be worth revisiting once the manually-curated list needs to scale beyond Colombo to
  other cities (spec mentions Kandy/Galle and city-by-city rollout).

### Reviewed Todos (not folded)
None — no pending todos existed for this phase (`todo.match-phase` returned 0 matches).

</deferred>

---

*Phase: 1-Business Directory Foundation*
*Context gathered: 2026-09-13*
