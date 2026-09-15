# LankaReview

## What This Is

A two-sided local marketplace for Sri Lanka — "Yelp for Sri Lanka." Consumers search,
browse, and read crowd-sourced reviews/photos/ratings of local businesses to decide
where to eat, shop, or hire a service, for free. Businesses get a free listing page and
pay for paid placement/ads, SaaS tools (reservations, waitlist, leads), and enhanced
profile features. Launch vertical is restaurants & food in Colombo, expanding city by
city and into home & local services.

## Core Value

The free consumer review/search product must stay trustworthy and useful — that trust is
the asset every business-side revenue stream (ads, SaaS, subscriptions) is sold against.
If monetization ever degrades review-corpus quality or search trust, the whole model fails.

## Business Context

- **Customer**: Two-sided — consumers (free, acquisition engine) and local businesses
  (freemium: ads, SaaS, subscriptions pay the bills)
- **Revenue model**: CPC ads, subscription tiers (Enhanced Profile, Guest Manager,
  AI Call Answering), deal/gift-certificate commission on redemption, later a paid API tier
- **Success metric**: Review/listing density and search-session-to-decision quality in the
  launch city (Colombo) — revenue only starts meaningfully in Phase 2+
- **Strategy notes**: Full build specification captured in `.planning/research/` and this
  document; see spec sections referenced throughout for detail this file summarizes

## Requirements

### Validated

- ✓ Business listings with structured data: categories (primary + secondary), hours
  (split shifts, holiday overrides, live open/closed), district/DS-division address +
  lat/lng map pin, category-conditional attributes, photo gallery, restaurant menu tab
  (photos only) — Phase 1
- ✓ Seed dataset of real Colombo businesses (107, all 16 leaf categories incl. tuk repair/
  tutoring/wedding vendors/tailoring) so the directory isn't empty at launch — Phase 1
- ✓ Consumer accounts with phone-OTP-first auth (dev-stub SMS transport), guest browsing
  with zero login prompts anywhere, progressive profile — Phase 2
- ✓ Search & discovery: search bar (what/where via geolocation or district), map + list
  results, category/price/open-now/attribute filters, 4 sort options, "Recommended" sort
  (Postgres tsvector relevance + geo-decay + neutral rating term, architecturally isolated
  from a future ad layer), home discovery rails (Trending/New/Category Shortcuts — no
  fabricated "Top Rated" rail since no real ratings exist until Phase 3) — Phase 2
- ✓ `language_pref` scaffolding + header switcher (persists preference only, no translated
  strings yet) — Phase 2
- ✓ Write/edit reviews: star rating + text (min 50 chars), one review per user per business
  (DB unique constraint), optional photos (URL-only, no upload infra yet), server-side
  rules-based review filter (recommended vs not_recommended) that never informs the user
  in real time whether their review was filtered — response shape structurally can't leak
  the outcome — Phase 3
- ✓ "X reviews not currently recommended" disclosure link — filtered reviews stay readable
  via real live count + lazy-fetched expand, never silently hidden or deleted — Phase 3
- ✓ Default review sort blends recency + reviewer credibility + a neutral (not fabricated)
  helpfulness placeholder, with explicit Newest/Highest/Lowest override — Phase 3
- ✓ Review filter logs structured signals (account age, burst-posting, text-similarity) as
  real JSON for a future advertiser-parity audit — Phase 3
- ✓ Basic automated moderation: profanity/hate-speech/PII pre-publish filter on review TEXT
  — Phase 3 (photo-content moderation explicitly deferred to Phase 5's upload
  infrastructure via a documented VERIFICATION.md override; no photo content/caption
  exists yet to moderate, only third-party URL strings)

### Active

- [ ] Business profile page: Q&A, "people also viewed", Consumer Alert banner slot (even
      if alerts system itself is a later phase)
- [ ] Review voting (Useful/Funny/Cool as independent toggles) and one public owner
      response per review (once claim flow exists)
- [ ] Photo uploads by any logged-in user, with basic automated moderation (NSFW/
      irrelevance) before going live
- [ ] Q&A on business pages (ask/answer/vote)
- [ ] Collections/bookmarks, including public shareable collections
- [ ] Business claim flow (search-and-claim or create) with phone-OTP or business-
      registration-document verification
- [ ] Trilingual UI scaffolding (English first, Sinhala/Tamil structurally supported via
      `language_pref` even if translations land after English)

### Out of Scope (this milestone)

- CPC ad auction engine, subscription billing, business dashboard analytics — Phase 2
- Reservations/waitlist (Guest Manager) — Phase 3
- Request-a-Quote / leads inbox for service businesses — Phase 4
- Consumer Alerts, two-person moderation review, transparency reporting, Elite/Insiders
  community program — Phase 5 (build before a scandal forces it, not this milestone)
- Public API licensing, AI call-answering add-on, personalization/recommendation ML — Phase 6
- Deals & gift certificates commerce (escrow, redemption, commission) — deferred with
  Phase 2 monetization since it needs payment rails
- Multi-location/enterprise console — low priority, build only once chain customers ask

## Context

- Full product/engineering spec (data model, IA, algorithms, trust & safety design,
  localization requirements) was supplied in one document and is treated as the
  authoritative source for scope and design decisions across all future phases, not just
  this milestone. Reference sections by number (e.g. "Section 6.3") when they inform a
  decision.
- Reverse-engineered from Yelp's actual mechanisms (ranking, review filtering, ad auction,
  moderation, Elite program), adapted for the Sri Lankan market: LKR pricing, PayHere/
  Frimi payment rails, Sinhala/Tamil/English trilingual UI, Sri Lanka Business
  Registration / Registrar of Companies verification instead of US professional licensing,
  phone-OTP-first identity, district/DS-division address model instead of ZIP codes.
- The review-filter system (spec 6.3) is the single most legally/reputationally sensitive
  system in the product — it must be provably independent of advertiser status from day
  one, even though the ad auction itself doesn't exist until Phase 2. Build the audit
  logging hooks now so Phase 5's transparency reporting has data to report on.
- Author has existing AgentOS voice-agent expertise (named agents: Arun, Nehara, Nimali,
  a credit-reminder agent) — relevant to the Phase 6 AI Call Answering stretch goal, not
  this milestone.
- Primary launch vertical: restaurants & food (highest review velocity, easiest density in
  Colombo/Kandy/Galle). Secondary: home & local services (the informal-services gap —
  three-wheeler/tuk repair, tutoring, wedding vendors, tailoring — is the biggest
  differentiation opportunity vs. copying Yelp verbatim, but that build-out is Phase 4).

## Constraints

- **Team**: Solo/small team, no fixed launch deadline — phase-by-phase incremental build
- **Budget**: Bootstrap — minimize infrastructure cost until Phase 2 revenue exists.
  Favor free/cheap tiers (self-hosted OpenSearch over managed, lowest-cost cloud region
  with LK-adjacent latency, free-tier SMS/OTP sandbox during development) over paid
  managed services until there's revenue to justify them.
- **Tech stack**: Node.js/TypeScript backend, React Native mobile (confirmed by user;
  do not relitigate). Postgres + PostGIS as source of truth, OpenSearch for search index.
  Web framework and payment/SMS provider specifics to be confirmed during stack research.
- **Localization**: Sri Lanka Personal Data Protection Act alignment required from the
  start (consent for marketing notifications, real account-deletion path, minimal
  moderation-log retention). Phone-first identity over email-first.
- **Compliance**: Sponsored/paid results must always be clearly labeled per advertising-
  disclosure norms once ads exist (Phase 2) — architecturally separate from organic
  ranking from the first line of ranking code, not bolted on later.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Backend: Node.js/TypeScript | User's confirmed choice; single language across backend, easier context-switching for a small/solo team | ✓ Good — Prisma 7 + Next.js 16 route handlers proved productive in Phase 1 |
| Mobile: React Native | User's confirmed choice; single codebase for iOS/Android, faster for a lean team | — Pending (deferred past Phase 1, web-only so far) |
| Phase 1 scope = Consumer MVP only, no payments | Matches spec's own Section 18 phasing; avoid building monetization before there's a trustworthy free product to sell against | ✓ Good — Phase 1 shipped clean with zero payment/ads surface |
| Review filter never tells the user in real time if they were filtered | Prevents reviewers from gaming disclosed filter criteria; matches spec 6.3 and Yelp's own documented rationale | — Pending (reviews are Phase 3) |
| Ad auction and organic ranking kept as architecturally separate systems | Spec 6.1 — blending the two is exactly the ambiguity behind Yelp's real-world extortion lawsuits; cheaper to separate now than retrofit later | — Pending (ads are Phase 2+) |
| Bootstrap budget: self-hosted/free-tier infra until Phase 2 revenue | User confirmed cost-minimization priority for a pre-revenue solo/small-team build | ✓ Good — local Docker Postgres+PostGIS, no paid services in Phase 1 |
| Web only for Phase 1, React Native deferred | Discuss-phase decision (01-CONTEXT.md D-01) — get a stable API/data model before committing to a second client | ✓ Good — kept Phase 1 scope tight |
| Category attributes as flexible jsonb + static TS config (not DB table) | 01-CONTEXT.md D-02 / 01-RESEARCH.md — no admin UI exists yet to justify a DB-driven config; Zod schemas per category give type safety without a migration per new attribute | ✓ Good |
| Menu tab is photos-only, no structured MenuItem entity | 01-CONTEXT.md D-03 — real menu data (name/price) was out of scope for v1; avoids building a data model with no real seed data to populate it | ✓ Good |
| Seed data manually curated (no scraping/OSM) | 01-CONTEXT.md D-04 — avoids ToS risk; 107 real Colombo businesses across all 16 leaf categories proved sufficient to avoid an empty directory | ✓ Good |
| Worktree isolation disabled for single-plan-per-wave phases | Phase 1's 4 waves each had exactly one plan — no parallel-write risk to protect against, and sequential execution on the main tree avoids the git-worktree-manifest/merge-back machinery entirely | ✓ Good — simplified execution with no loss of safety |
| Search: Postgres native full-text search (tsvector/GIN + pg_trgm), not OpenSearch | 02-CONTEXT.md D-01 — bootstrap-budget-appropriate at ~107 businesses; query layer structured so a future OpenSearch swap doesn't require a data-model rewrite | ✓ Good |
| No "Top Rated" home rail until real ratings exist (Phase 3) | 02-CONTEXT.md D-09, extends D-02's no-fabricated-ratings principle to discovery rails, not just search ranking | ✓ Good |
| Auth: iron-session httpOnly cookies + dev-stub OTP transport, no framework | 02-CONTEXT.md D-03/D-04 — real SMS provider deferred until there's a reason to pay for it; avoids a heavy auth framework dependency for a phone-OTP-only surface | ✓ Good |
| Starting Phase 3: skip the full discuss/research/UI-spec/plan-checker ceremony, implement directly from ROADMAP + original spec context | User's explicit instruction (2026-09-15) — the original spec supplied at project init is already deep enough that the multi-document planning pipeline is redundant overhead for the remaining phases | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-15 after Phase 3*
