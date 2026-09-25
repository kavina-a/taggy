# Roadmap: LankaReview

## Overview

This milestone (Phase 1 / Consumer MVP, no payments or ads) builds LankaReview from an empty
database to a usable "Yelp for Sri Lanka" consumer product. The journey starts with a real,
structured directory of Colombo businesses that people can browse before any other feature
exists, then layers on search, filtering, and ranking so that directory is actually findable,
then opens guest-first account creation so browsers can take their first logged-in action.
From there the product's core trust asset comes online: consumers write and read
algorithmically-filtered, credible reviews that set each business's public rating — the
single most reputationally sensitive system in the product. Once reviews exist, the roadmap
adds the social layer around them (voting, business-owner claim + response, reporting) before
finally rounding out business pages with photos, Q&A, and shareable collections. By the end of
this milestone, a Colombo consumer can discover, evaluate, and meaningfully engage with real
local businesses end-to-end, with zero monetization in the loop yet.

**Milestone v2.0 — Yelp Parity Redesign** (Phases 6-10) picks up immediately after the Consumer
MVP ships and restyles/rebuilds that same product to match yelp.com's layout, structure, and
page set (never its brand assets), without touching any already-working backend capability.
The journey starts by making the seeded database honest — real reviews, real users, real
photos, no test-fixture leakage — because every later page in this milestone renders against
that data. It then builds one shared design system (color tokens, typography, Header, Footer,
StarRating, buttons, modal, cookie banner) so every subsequent page has one place to pull
components from instead of styling each page independently. Home and Search get rebuilt on
that system first since they're the entry point to everything else, then the business page
(plus its already-functional review/vote/owner-response/photo/Q&A features) gets restyled
and gains a new Write a Review flow — deliberately shipping the full page at `/business/[slug]`
before the modal-over-search variant, so the underlying page is provably correct before the
harder interception routing is layered on. The milestone closes with Login/Signup restyled and
a new multi-step Claim wizard, plus a 404 page and stub pages so no footer link dead-ends. By
the end of this milestone, LankaReview looks and feels like a mature "Yelp for Sri Lanka"
product on top of the same trustworthy Consumer MVP backend — still with zero monetization
surface.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Business Directory Foundation** - Real, structured Colombo business listings exist and are fully browsable (completed 2026-09-13)
- [x] **Phase 2: Search, Discovery & Accounts** - Users can search/filter/sort the directory and browse as guests or sign up via phone OTP (completed 2026-09-15)
- [x] **Phase 3: Reviews & Ratings** - Users can write and read trustworthy, filtered reviews that set each business's rating (completed 2026-09-15)
- [x] **Phase 4: Voting, Owner Response & Reporting** - Users can vote on reviews, claimed owners can respond, and anyone can report bad content (completed 2026-09-15)
- [x] **Phase 5: Rich Content — Photos, Q&A & Collections** - Users can add photos, ask/answer questions, and save businesses into shareable collections (completed 2026-09-16)
- [ ] **Phase 6: Data Foundation** - The seeded database has real, high-quality content (reviews, users, photos, Q&A) with no test-fixture leakage or broken images
- [ ] **Phase 7: Design System** - A shared component library and full retheme exist for every later page to build on
- [ ] **Phase 8: Home & Search** - The home page and search results page are rebuilt on the new design system
- [ ] **Phase 9: Business Page, Reviews/Photos/Q&A Restyle & Write a Review** - The business page and its existing review/photo/Q&A features are restyled, plus a new Write a Review flow ships
- [ ] **Phase 10: Login, Signup & Claim** - /login is restyled, /signup and a multi-step /claim wizard are built, and no footer link 404s

## Phase Details

### Phase 1: Business Directory Foundation

**Goal**: A real, structured, browsable directory of Colombo businesses exists — the foundation every later phase (search, reviews, photos) is built on top of.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LOC-02
**Success Criteria** (what must be TRUE):

  1. A user can open a business profile page showing its name, up to 3 primary + unlimited secondary categories, description, and a district/DS-division + free-text address (no ZIP) with an accurate lat/lng map pin.
  2. A user can see a business's structured 7-day hours with split shifts and holiday overrides, plus a live "Open now"/"Closed" state.
  3. A user can view category-conditional attributes (e.g. delivery/takeout/outdoor seating for restaurants; license-verified/free-estimates for home services) and browse a photo gallery, with restaurants also showing a dedicated pinned menu tab.
  4. The directory already contains real, seeded Colombo businesses spanning the Sri Lanka-relevant category taxonomy (including tuk repair, tutoring, wedding vendors, tailoring), so the app isn't empty at first use.

**Plans**: 5/5 plans complete
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Walking Skeleton: Next.js + Prisma/Postgres+PostGIS scaffold, full schema + migration, minimal seed, directory index + business page + map click-through

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Structured hours + live "Open now"/"Closed" badge (overnight-shift and holiday-override safe)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Category taxonomy + jsonb attribute badges + photo gallery + restaurant Menu tab

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04-PLAN.md — Full 100-300-business seed dataset, transactional/idempotent seeding, category-grouped paginated directory index

**Wave 5 (gap closure)** *(blocked on Wave 4 completion — closes 01-VERIFICATION.md's LIST-01 PARTIAL finding)*

- [x] 01-05-PLAN.md — Render secondaryCategories as a distinct badge group + wire the shadcn breadcrumb into the business page

**UI hint**: yes

### Phase 2: Search, Discovery & Accounts

**Goal**: Users can find businesses in the seeded directory through search, filters, and ranking, and can browse entirely as guests, signing up only when they're ready to take an action.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, SRCH-06, AUTH-01, AUTH-02, AUTH-03, LOC-01
**Success Criteria** (what must be TRUE):

  1. A user can search by free-text "what" + geo "where" (defaulting to detected location) and see ranked business results as cards (photo, name, category, price, rating+count, distance, snippet, open/closed badge) alongside a map with pins.
  2. A user can filter results by category, price tier, open-now, distance radius, rating threshold, and category-conditional attributes, and sort by Recommended (default), Highest Rated, Most Reviewed, or Distance.
  3. The default "Recommended" sort blends text/category relevance, geo-decay, and a Bayesian/Wilson-score-adjusted rating rather than a naive average, and is architecturally isolated so a future ad layer can interleave without modifying it.
  4. The home/discovery page shows rails such as trending nearby, top rated this month, new businesses, and category shortcuts.
  5. Any user can search, browse, and read everything with zero login prompts; when they do sign up it's via phone OTP (email optional), with no forced full-profile step, and they can set a language preference (English complete; Sinhala/Tamil structurally supported).

**Plans**: 9/9 plans complete
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Foundations: npm/shadcn deps, Prisma schema (search indexes + User/OtpChallenge), OTP hashing primitives

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Search Engine Core: ranked tsvector+geo-decay+neutral-rating query, filters, sort, open-now post-filter
- [x] 02-03-PLAN.md — Auth Core: OTP send/verify, rate limiting, iron-session

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-04-PLAN.md — Search Results Page & Search Bar (SSR + API route + extended BusinessCard)
- [x] 02-05-PLAN.md — Auth UI: phone-OTP login flow + progressive-profile prompt
- [x] 02-06-PLAN.md — Header session wiring + language switcher

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-07-PLAN.md — Home Discovery Page (rails + category shortcuts)
- [x] 02-08-PLAN.md — Search Filters, Sort & Map

**Wave 5 (integration)** *(blocked on Wave 4 completion)*

- [x] 02-09-PLAN.md — Guest-browsing regression test + full cross-cutting e2e smoke path

**UI hint**: yes

### Phase 3: Reviews & Ratings

**Goal**: Users can write and read trustworthy reviews that shape a business's public rating, with a review-filter system that is provably independent of who's watching in real time.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: REV-01, REV-02, REV-03, REV-04, REV-05, REV-06, MOD-01
**Success Criteria** (what must be TRUE):

  1. On a business's page, a logged-in user can write exactly one review — rating 1-5 first, then text meeting a minimum length, with optional photos — enforced by a DB-level unique constraint on (user, business).
  2. A user can edit their own review at any time, and editing re-runs the review filter.
  3. Every review is synchronously classified as recommended or not_recommended at publish time, and the author is never told in real time which bucket they landed in.
  4. Not-recommended reviews remain readable behind an explicit "X reviews not currently recommended" link on the business page and are excluded only from the public average/default view, never deleted or hidden without access.
  5. The default review list on the business page blends recency, reviewer credibility, and helpfulness votes, with an explicit Newest/Highest/Lowest override always available; every review also passes a profanity/hate-speech/PII check before publishing, and the filter logs signals (history, burst/timing, text similarity) usable for a future advertiser-parity audit.

**Plans**: 2/2 chunks complete (executed directly from this roadmap + REQUIREMENTS.md,
skipping the discuss/research/plan-checker ceremony per the user's 2026-09-15 instruction —
no PLAN.md/CONTEXT.md/RESEARCH.md artifacts, only SUMMARY.md)

- [x] 03-backend — Review/ReviewPhoto data model, Business.avgRating/reviewCount, MOD-01
      content classifier, REV-03/REV-06 rules-based filter engine, review create/edit/read
      API routes (response-shape secrecy enforced), real rating data wired into search
      ranking/sort/filter. Covers REV-01, REV-02, REV-03, REV-06, MOD-01.
      See `.planning/phases/03-reviews-ratings/03-backend-SUMMARY.md`.

- [x] 03-ui — StarRatingInput/ReviewComposer/ReviewCard/ReviewList/ReviewSortDropdown,
      lib/reviews/sort-reviews.ts's tested blended/newest/highest/lowest ordering, the
      never-hidden "X reviews not currently recommended" disclosure, and full business-page
      wiring (guest login prompt vs. composer, server-side review fetch). Covers REV-04,
      REV-05. See `.planning/phases/03-reviews-ratings/03-ui-SUMMARY.md`.

**UI hint**: yes

### Phase 4: Voting, Owner Response & Reporting

**Goal**: Users can react to reviews, verified business owners can respond publicly, and anyone can report bad content — the first point the product creates a relationship with the business side, without any payments or dashboards yet.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: VOTE-01, VOTE-02, CLAIM-01, MOD-02
**Success Criteria** (what must be TRUE):

  1. On the business page, any user can independently toggle Useful, Funny, and Cool on a review.
  2. A business owner can claim an unclaimed listing (or create a new one) via phone-OTP verification to the listed number.
  3. Once claimed, the verified owner can post exactly one public "Response from the owner" reply beneath a review on the business page.
  4. Any user can one-tap report/flag a review, photo, or business from its page, picking a reason, and receives only a submission confirmation with no visibility into the outcome.

**Plans**: 1/1 chunk complete (executed directly from this roadmap + REQUIREMENTS.md,
skipping the discuss/research/plan-checker ceremony per the user's 2026-09-15 instruction —
no PLAN.md/CONTEXT.md/RESEARCH.md artifacts, only SUMMARY.md)

- [x] 04-implementation — ReviewVote + OwnerResponse + Report schema, vote toggle API
      with real helpfulness score in blended sort, phone-OTP claim (purpose-namespaced
      from login) and OTP-gated create-listing, one owner response per review, report
      confirmation-only serializer, and the matching business-page UI. Covers VOTE-01,
      VOTE-02, CLAIM-01, MOD-02.
      See `.planning/phases/04-voting-owner-response-reporting/04-implementation-SUMMARY.md`.

**UI hint**: yes

### Phase 5: Rich Content — Photos, Q&A & Collections

**Goal**: Business pages become richer through community contributions — photos beyond reviews, questions and answers, and shareable saved lists — rounding out the Consumer MVP.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: PHOTO-01, PHOTO-02, QA-01, COLL-01, COLL-02
**Success Criteria** (what must be TRUE):

  1. Any logged-in user (not just reviewers) can upload a photo to a business page.
  2. Uploaded photos pass basic automated moderation (NSFW/irrelevance) before appearing live.
  3. Any user can post a question on a business page, any user (including the owner) can answer, answers are votable, and the top-voted answer surfaces first.
  4. A logged-in user can save a business to a default "My Saved Places" list or a named list, and can make any collection public with a shareable link.

**Plans**: 1/1 chunk complete (executed directly from this roadmap + REQUIREMENTS.md,
skipping the discuss/research/plan-checker ceremony per the user's 2026-09-15 instruction —
no PLAN.md/CONTEXT.md/RESEARCH.md artifacts, only SUMMARY.md)

- [x] 05-implementation — community photo upload + classifyPhoto gate, Q&A with
      votable answers sorted top-voted first, default My Saved Places + named/public
      collections. Covers PHOTO-01, PHOTO-02, QA-01, COLL-01, COLL-02.
      See `.planning/phases/05-rich-content-photos-qa-collections/05-implementation-SUMMARY.md`.

**UI hint**: yes

### Phase 6: Data Foundation

**Goal**: The seeded database has real, high-quality content (reviews, users, photos, Q&A) with no broken images or test-fixture leakage, so every later UI phase in this milestone has real data to render against.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10
**Success Criteria** (what must be TRUE):

  1. No `mu3…` test fixtures or `picsum.photos` placeholder images appear anywhere in the app — every business photo is a local, category-matched image, and every Business/Review/User record carries an `isTest` flag that keeps any remaining fixtures out of every UI surface.
  2. Every business page renders human-readable category labels everywhere (never a raw category slug).
  3. Every seeded business shows 5-60 reviews with a realistic rating distribution (skewed 3-5 stars), dates spread over 3 years, 80-400 word bodies, some carrying 1-3 photos, and every review/photo carries real vote counts and a content tag respectively.
  4. Every seeded business shows 0-5 real Q&A threads with answers, and business/search/home pages carry correct, business-specific browser-tab titles (never the literal "localhost").
  5. 60+ seeded users exist with avatars, names, cities, friend/review/photo counts, and elite-year badges, and the Business schema carries `guaranteed`/`responseTime`/`responseRate` fields ready for Phase 9's business page to read.

**Plans**: 2/7 plans executed
Plans:
**Wave 1**

- [x] 06-01-PLAN.md — Schema migration (all Phase 6 fields/enums in one pass) + businessSeedSchema extension + one-time mu3 test-fixture cleanup

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 06-02-PLAN.md — isTest filtering: search engine, open-now lookup, rail loaders, home page
- [ ] 06-03-PLAN.md — isTest filtering: directory index, business detail page, reviews/photos/questions/collections sub-routes
- [ ] 06-04-PLAN.md — 70 deterministic seeded users (avatars/names/cities/counts/eliteYear) + 0-5 Q&A threads per business
- [ ] 06-05-PLAN.md — Local category-matched seed images (Pexels/Pixabay + SVG fallback) + guaranteed/responseTime/responseRate subset

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 06-06-PLAN.md — Category-label badge fix + generateMetadata on home/search/business pages
- [ ] 06-07-PLAN.md — Realistic review corpus (5-60/business, rating distribution, vote-backed counts, tagged photos) + Business.avgRating recompute

**UI hint**: yes

### Phase 7: Design System

**Goal**: A shared component library (Header, Footer, StarRating, OpenStatus, Modal, buttons/chips, SectionLinkList, cookie banner) and a full retheme (color tokens, Poppins/Open Sans typography) exist, ready for every later page in this milestone to build on.
**Mode:** mvp
**Depends on**: Phase 6 (needs real seeded data to build/preview components against)
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-07, DESIGN-08, DESIGN-09
**Success Criteria** (what must be TRUE):

  1. Every page renders with the spec's red/teal/rating-tier color tokens and Poppins (headings/nav/buttons) + Open Sans (body) typography via `next/font`, with the existing Sinhala/Tamil fallback chain still intact.
  2. Every non-minimal page renders a shared `<Header>` (transparent/white/minimal/legacy variants, hover-triggered category mega-nav) and a shared `<Footer>` with the spec's 5-column link layout.
  3. Ratings render everywhere through the shared rounded-square `<StarRating>` component in tier colors with a formatted review-count label, and open/closed state renders through the shared plain-text `<OpenStatus>` component.
  4. Buttons and chips across the app use the spec's primary/secondary/gray-pill/filter-chip styles, and a shared focus-trapped `<Modal>` backs a login-wall shown whenever a logged-out user attempts Save/Follow/Message/etc.
  5. A shared `<SectionLinkList>` component (4-column link list with "Show more") and a cookie-consent banner exist and render correctly, ready for Home/Search/Business pages to consume.

**Plans**: TBD
**UI hint**: yes

### Phase 8: Home & Search

**Goal**: The home page and search results page are rebuilt on Phase 7's design system, matching the spec's layout and content.
**Mode:** mvp
**Depends on**: Phase 7
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, SEARCHUI-01, SEARCHUI-02, SEARCHUI-03
**Success Criteria** (what must be TRUE):

  1. The home page shows a full-bleed autoplay hero carousel with slide captions and a red pill CTA linking to search.
  2. The home page shows a 3-column Recent Activity feed of review/photo/check-in cards, a categories grid with two-tone (non-repeating) icons, and city chips with Top/Trending/Seasonal `SectionLinkList`s for the selected city.
  3. The search results page shows a results column next to a sticky map styled per spec, with numbered pins and hover-sync between a result row and its pin.
  4. The search results page shows the spec's filter chip row and full filter panel (price, suggested, dietary, category, features, distance).
  5. The search results page header shows the spec's "Top 10 Best {Query} Near {City}" H1 and a sort dropdown.

**Plans**: TBD
**UI hint**: yes

### Phase 9: Business Page, Reviews/Photos/Q&A Restyle & Write a Review

**Goal**: The business page — and its already-functional review/vote/owner-response/photo/Q&A features shipped in Phases 3-5 — is restyled onto Phase 7's design system, and a new Write a Review flow ships. The business page must work as a normal full page at `/business/[slug]` before the intercepted-route modal-over-search variant is attempted; the modal variant is the last task in this phase, not an early one.
**Mode:** mvp
**Depends on**: Phase 8
**Requirements**: BIZPAGE-01, BIZPAGE-02, BIZPAGE-03, BIZPAGE-04, BIZPAGE-05, WRITEREV-01
**Success Criteria** (what must be TRUE):

  1. The business page header (photo-strip or round-logo variant) matches the spec's layout — name, `StarRating`, claimed/category line, `OpenStatus`, and action row.
  2. The business page's hours, amenities, about, Q&A, and people-also-viewed sections render in the spec's layout and order, reusing the existing review/vote/Q&A data and APIs from Phases 3-5 without re-implementing them.
  3. The Recommended Reviews section matches the spec's layout — rating breakdown bars, sort/language/rating filters, and reaction buttons — using the existing review/vote data.
  4. The Photos section renders the spec's tabbed grid with a working lightbox.
  5. A user can reach the business page as a normal full page at `/business/[slug]`, and from it start a Write a Review flow that lets them pick a star rating, write a review with tag-chip prompts, and autosave a draft, matching the spec's layout; only after that full page works does the same business page also become reachable as an intercepted modal over search results.

**Plans**: TBD
**UI hint**: yes

### Phase 10: Login, Signup & Claim

**Goal**: `/login` is restyled, `/signup` and a multi-step `/claim` wizard are built, and a 404 page plus footer-linked stub pages exist so no footer link 404s.
**Mode:** mvp
**Depends on**: Phase 9
**Requirements**: LOGINUI-01, LOGINUI-02, LOGINUI-03, CLAIMUI-01, STUB-01
**Success Criteria** (what must be TRUE):

  1. `/login` shows the spec's two-column layout with phone OTP as the primary, unchanged auth flow.
  2. A new `/signup` page exists with the spec's form fields and layout.
  3. (Stretch, optional) "Continue with Google" appears on login/signup only if it was low-effort to integrate — its absence does not block this phase; Apple sign-in is out of scope entirely.
  4. A user can walk a multi-step `/claim` wizard (business name → email → phone OTP → address/map → categories → hours → photos → done), seeing a live business-page preview from step 2 onward, replacing the old ad-hoc `/businesses/new` flow.
  5. Visiting an unknown URL shows a styled 404 page, and every footer link resolves to a real stub page (about, terms, privacy, support, etc.) instead of 404ing.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Business Directory Foundation | 5/5 | Complete    | 2026-09-13 |
| 2. Search, Discovery & Accounts | 9/9 | Complete    | 2026-09-15 |
| 3. Reviews & Ratings | 2/2 | Complete    | 2026-09-15 |
| 4. Voting, Owner Response & Reporting | 1/1 | Complete    | 2026-09-15 |
| 5. Rich Content — Photos, Q&A & Collections | 1/1 | Complete    | 2026-09-16 |
| 6. Data Foundation | 2/7 | In Progress|  |
| 7. Design System | 0/? | Not started | - |
| 8. Home & Search | 0/? | Not started | - |
| 9. Business Page, Reviews/Photos/Q&A Restyle & Write a Review | 0/? | Not started | - |
| 10. Login, Signup & Claim | 0/? | Not started | - |

---
*Roadmap created: 2026-09-13*
*Granularity: standard (5 phases) — Phase 1/Consumer MVP scope only; v2 requirements (business platform, reservations, leads, trust layer maturity, API/AI) are tracked in REQUIREMENTS.md but intentionally out of this roadmap.*
*Milestone v2.0 "Yelp Parity Redesign" roadmap added: 2026-09-24 — Phases 6-10, standard granularity (5 phases), 37/37 v2.0 requirements mapped, sequential dependency chain continuing from Phase 5.*
