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

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Business Directory Foundation** - Real, structured Colombo business listings exist and are fully browsable (completed 2026-09-13)
- [ ] **Phase 2: Search, Discovery & Accounts** - Users can search/filter/sort the directory and browse as guests or sign up via phone OTP
- [ ] **Phase 3: Reviews & Ratings** - Users can write and read trustworthy, filtered reviews that set each business's rating
- [ ] **Phase 4: Voting, Owner Response & Reporting** - Users can vote on reviews, claimed owners can respond, and anyone can report bad content
- [ ] **Phase 5: Rich Content — Photos, Q&A & Collections** - Users can add photos, ask/answer questions, and save businesses into shareable collections

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

**Plans**: 6/9 plans executed
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

- [ ] 02-07-PLAN.md — Home Discovery Page (rails + category shortcuts)
- [ ] 02-08-PLAN.md — Search Filters, Sort & Map

**Wave 5 (integration)** *(blocked on Wave 4 completion)*

- [ ] 02-09-PLAN.md — Guest-browsing regression test + full cross-cutting e2e smoke path

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

**Plans**: TBD
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

**Plans**: TBD
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

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Business Directory Foundation | 5/5 | Complete    | 2026-09-13 |
| 2. Search, Discovery & Accounts | 6/9 | In Progress|  |
| 3. Reviews & Ratings | 0/TBD | Not started | - |
| 4. Voting, Owner Response & Reporting | 0/TBD | Not started | - |
| 5. Rich Content — Photos, Q&A & Collections | 0/TBD | Not started | - |

---
*Roadmap created: 2026-09-13*
*Granularity: standard (5 phases) — Phase 1/Consumer MVP scope only; v2 requirements (business platform, reservations, leads, trust layer maturity, API/AI) are tracked in REQUIREMENTS.md but intentionally out of this roadmap.*
