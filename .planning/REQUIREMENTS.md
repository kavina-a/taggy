# Requirements: LankaReview

**Defined:** 2026-09-13
**Core Value:** The free consumer review/search product must stay trustworthy and useful — that trust is the asset every business-side revenue stream is sold against.

## v1 Requirements

Requirements for the initial release (Consumer MVP — spec Section 18, Phase 1). No payments, ads, or business-side monetization yet. A minimal claim mechanism is included only because owner responses require distinguishing a verified owner from an anonymous reviewer; full business verification/dashboard is v2.

### Listings

- [x] **LIST-01**: Business listing exists with name, categories (up to 3 primary + unlimited secondary), description, structured address (district/DS-division + free text, no ZIP), lat/lng
- [x] **LIST-02**: Business listing has structured hours (7-day, split shifts, holiday overrides) with "Open now"/"Closed" computed state
- [x] **LIST-03**: Business listing has category-conditional attributes (jsonb; e.g. restaurants: delivery/takeout/outdoor seating; home services: license verified/free estimates)
- [x] **LIST-04**: Business listing supports photo gallery and, for restaurants, a distinct menu tab with pinned menu photos
- [x] **LIST-05**: Category taxonomy seeded with Sri Lanka-relevant leaf categories (Appendix A), including locally-distinct ones (tuk repair, tutoring, wedding vendors, tailoring)
- [x] **LIST-06**: Unclaimed businesses seeded from a real Colombo starter dataset so search isn't empty at launch (spec Phase 0)

### Search & Discovery

- [x] **SRCH-01**: Search bar (free-text "what" + geo "where", defaulting to detected location) returns ranked business results
- [x] **SRCH-02**: Results page shows business cards (photo, name, category, price tier, rating+count, distance, snippet, open/closed badge) plus a map with pins
- [x] **SRCH-03**: Filters: category, price tier, open now, distance radius, rating threshold, category-conditional attributes
- [x] **SRCH-04**: Sort options: Recommended (default), Highest Rated, Most Reviewed, Distance
- [x] **SRCH-05**: "Recommended" sort blends text/category relevance, geo-decay, and a Bayesian/Wilson-score-adjusted rating (never a naive average) — implemented so a future ad-auction layer can interleave without touching this score (spec 6.1)
- [x] **SRCH-06**: Home/discovery page shows rails (trending near you, top rated this month, new businesses, category shortcuts)

### Reviews

- [x] **REV-01**: Logged-in user can write one review per business (rating 1-5 required first, then text with enforced minimum length, optional photos) — DB-level unique constraint on (user, business)
- [x] **REV-02**: User can edit their own review at any time; edits re-run the review filter
- [x] **REV-03**: Every review runs synchronously through a rules-based filter at publish time, setting `visibility_status` to `recommended` or `not_recommended` — the author is never told in real time whether they were filtered (spec 6.3)
- [x] **REV-04**: Filtered ("not_recommended") reviews remain readable via an explicit "X reviews not currently recommended" disclosure link and are excluded only from the public average/default view, never deleted or hidden without access
- [x] **REV-05**: Default review display order blends recency, reviewer credibility (account history), and helpfulness votes — with explicit Newest/Highest/Lowest override always available (spec 6.2)
- [x] **REV-06**: Review filter logic logs enough data (reviewer history signals, burst/timing, text-similarity) to support a future advertiser-parity audit, even before any advertisers exist

### Voting & Owner Response

- [x] **VOTE-01**: Reviews support three independent toggle vote types: Useful, Funny, Cool
- [x] **VOTE-02**: A claimed business's verified owner can post exactly one public response per review, labeled "Response from the owner"

### Photos & Q&A

- [x] **PHOTO-01**: Any logged-in user can upload a photo to a business page (not just reviewers)
- [x] **PHOTO-02**: Uploaded photos run through basic automated moderation (NSFW/irrelevance) before going live
- [x] **QA-01**: Any user can post a question on a business page; any user (including the owner) can answer; answers are votable and the top-voted answer surfaces first

### Collections

- [x] **COLL-01**: Logged-in user can save a business to a default "My Saved Places" list or a named list
- [x] **COLL-02**: Collections can be made public with a shareable link

### Auth

- [x] **AUTH-01**: Consumer signup/login via phone OTP (primary) with optional email
- [x] **AUTH-02**: Guest browsing is fully supported — no login required to search, browse, or read reviews; login required only to write reviews, message, or bookmark
- [x] **AUTH-03**: Progressive profile — signup does not require a full profile before browsing

### Moderation (basic)

- [x] **MOD-01**: Real-time profanity/hate-speech/PII classifier runs on every review and photo before publish
- [x] **MOD-02**: One-tap Report/Flag on any review, photo, or business with a reason picker; reporter gets confirmation only, no visibility into outcome

### Business Claim (minimal, owner-response only)

- [x] **CLAIM-01**: A business owner can claim an unclaimed (or create a new) listing via phone-OTP verification to the listed number — sufficient to unlock owner-response rights; full Business Registration document verification and multi-staff logins are v2 (spec 7.1)

### Localization

- [x] **LOC-01**: `language_pref` field exists on user accounts (en|si|ta) and drives a language switcher; English ships complete for v1, Sinhala/Tamil structurally supported for incremental translation
- [x] **LOC-02**: Address model uses district/DS-division + free text + lat/lng as source of truth, never a US-style ZIP/postal search

## v2.0 Requirements — Yelp Parity Redesign

Requirements for restyling/rebuilding the completed Consumer MVP to match yelp.com's
layout, structure, and page set — never its brand assets — per
`docs/lankareview-full-yelp-clone-prompt.md` (§12 Phase 1 / P0 tier only). All backend
capabilities below already exist and ship (Phases 1-5); these requirements are additive
UI/data-quality work on top of them unless noted otherwise.

### Data Foundation

- [x] **DATA-01**: Business schema has `guaranteed`, `responseTime`, `responseRate` fields
- [x] **DATA-02**: User schema has an `eliteYear` field
- [x] **DATA-03**: Business/Review/User records support an `isTest` flag; all `mu3…` test
      fixtures are flagged/deleted and excluded from every UI surface

- [ ] **DATA-04**: All seed business photos are local, category-matched images under
      `/public/seed`, not `picsum.photos` URLs

- [ ] **DATA-05**: The business page renders human-readable category labels everywhere,
      never a raw slug

- [ ] **DATA-06**: Every seeded business has 5-60 reviews with a realistic rating
      distribution (skewed 3-5 stars), dates spread over 3 years, 80-400 word bodies, and
      some reviews carrying 1-3 photos

- [x] **DATA-07**: Seeded reviews carry vote counts (Useful/Funny/Cool) and seeded photos
      carry a tag (`food|inside|outside|menu|drink|video`)

- [ ] **DATA-08**: Every seeded business has 0-5 Q&A threads with answers
- [x] **DATA-09**: 60+ seeded users exist with avatar, name, city, friend/review/photo
      counts, and `eliteYear`

- [ ] **DATA-10**: Business, search, and home pages emit `generateMetadata` titles matching
      the spec's format (never the literal "localhost")

### Design System

- [ ] **DESIGN-01**: `globals.css` defines the spec's red/teal/rating-tier color tokens,
      replacing the current orange `--brand-accent`

- [ ] **DESIGN-02**: Headings/nav/buttons render in Poppins and body text in Open Sans via
      `next/font`, with the existing Noto Sans Sinhala/Tamil fallback chain preserved

- [ ] **DESIGN-03**: A shared `<Header>` component supports transparent/white/minimal/
      legacy variants and a hover-triggered category mega-nav, replacing the current inline
      plain header bar in `app/layout.tsx`

- [ ] **DESIGN-04**: A shared `<Footer>` component with the spec's 5-column link layout
      renders on every non-minimal page (currently missing entirely)

- [ ] **DESIGN-05**: A `<StarRating>` display component renders rounded-square rating boxes
      in tier colors with a formatted review-count label, usable anywhere a rating shows
      (search cards, business page, reviews) — distinct from the existing
      `star-rating-input.tsx` write-review picker

- [ ] **DESIGN-06**: An `<OpenStatus>` component renders plain-text "Open"/"Closed" state,
      replacing the current pill badges

- [ ] **DESIGN-07**: Primary/secondary/gray-pill/filter-chip button and chip styles match
      the spec's radius/color rules

- [ ] **DESIGN-08**: A shared `<Modal>` component (focus trap, Esc/backdrop close) backs a
      login-wall modal shown whenever a logged-out user attempts Save/Follow/Message/etc.

- [ ] **DESIGN-09**: A `<SectionLinkList>` component (4-column link list with "Show more")
      and a cookie-consent banner exist as shared components

### Home & Search UI

- [ ] **HOME-01**: Home page shows a full-bleed autoplay hero carousel with slide captions
      and a red pill CTA linking to search

- [ ] **HOME-02**: Home page shows a 3-column Recent Activity feed of review/photo/check-in
      cards

- [ ] **HOME-03**: Home page shows a categories grid using two-tone category icons (no
      repeated icons)

- [ ] **HOME-04**: Home page shows city chips with Top/Trending/Seasonal `SectionLinkList`s
      for the selected city

- [ ] **SEARCHUI-01**: Search results page shows a results column with a sticky map styled
      per spec (numbered pins, hover-sync between row and pin)

- [ ] **SEARCHUI-02**: Search results page shows the spec's filter chip row and full filter
      panel (price, suggested, dietary, category, features, distance)

- [ ] **SEARCHUI-03**: Search results page header shows the spec's "Top 10 Best {Query}
      Near {City}" H1 and sort dropdown

### Business Page & Write a Review

- [ ] **BIZPAGE-01**: Business page header (photo-strip or round-logo variant) matches the
      spec's layout with name, `StarRating`, claimed/category line, `OpenStatus`, and
      action row

- [ ] **BIZPAGE-02**: Business page sections (hours, amenities, about, Q&A, people-also-
      viewed) render in the spec's layout and order, reusing existing data/APIs from
      Phases 3-5 without re-implementing them

- [ ] **BIZPAGE-03**: Recommended Reviews section matches the spec's layout (rating
      breakdown bars, sort/language/rating filters, reaction buttons) using the existing
      review/vote data

- [ ] **BIZPAGE-04**: Photos section/lightbox matches the spec's tabbed grid + lightbox
      layout

- [ ] **BIZPAGE-05**: The business page is reachable as a normal full page at
      `/business/[slug]` first; an intercepted-route modal-over-search variant is added
      last, only after the full-page version works

- [ ] **WRITEREV-01**: A Write a Review flow (landing + form) lets a user pick a star
      rating, write a review with tag-chip prompts, and autosave a draft, matching the
      spec's layout

### Login, Signup & Claim

- [ ] **LOGINUI-01**: `/login` is restyled to the spec's two-column layout with phone OTP
      as the primary flow (unchanged auth mechanism)

- [ ] **LOGINUI-02**: A new `/signup` page exists with the spec's form fields and layout
- [ ] **LOGINUI-03** (stretch): "Continue with Google" is added to login/signup only if
      low-effort to integrate; Apple sign-in is explicitly out of scope for this milestone

- [ ] **CLAIMUI-01**: A multi-step `/claim` wizard (business name → email → phone OTP →
      address/map → categories → hours → photos → done) replaces the current ad-hoc
      `/businesses/new` flow, with a live business-page preview from step 2 onward

- [ ] **STUB-01**: A styled 404 page and footer-linked stub pages (about, terms, privacy,
      support, etc.) exist so no footer link 404s

## v2 Requirements

Deferred to future phases per spec Section 18 (Phase 2 onward). Tracked but not in the Phase 1 roadmap.

### Business Platform (Phase 2)

- **BIZ-01**: Full business claim/verification flow — Business Registration certificate/trade license upload, professional-license verification for regulated categories, multi-staff logins with owner/manager permission tiers
- **BIZ-02**: Free business dashboard — profile views, calls, direction requests, messages, rating trend, competitor benchmarking
- **ADS-01**: Self-serve CPC ads manager — campaign builder, targeting, real-time performance dashboard, prepaid wallet billing
- **ADS-02**: CPC ad auction engine (bid × quality_score), architecturally separate from organic ranking, always ≥1 non-sponsored labeled result above the fold
- **SUB-01**: Enhanced Profile subscription tier with recurring billing and dunning flow (grace period, never abrupt delisting)
- **SUB-02**: Verified Registration badge (free, trust infrastructure)

### Restaurant Vertical (Phase 3)

- **RSV-01**: Reservations & waitlist manager (business side) — party queueing, wait-time estimation, SMS-when-ready, seated/no-show tracking
- **RSV-02**: Consumer-facing "Join Waitlist" / "Book a Table" widget on business profile with SMS notification

### Services Vertical (Phase 4)

- **LEAD-01**: Structured Request-a-Quote flow — category/description/budget/timeline/location fanned out to matching businesses, consumer compares responses in one inbox
- **LEAD-02**: Business-side leads inbox distinct from reviews/messages, with quote templates and hired/lost outcome tracking

### Trust Layer Maturity (Phase 5)

- **TRUST-01**: Manual moderation admin console with mandatory reason-code logging and two-person review required for any action against a paying-advertiser business
- **TRUST-02**: Consumer Alerts (public manipulation-flag banners) with documented appeal process and 90-180 day auto-expiry
- **TRUST-03**: Annual/quarterly transparency report, including advertiser-vs-non-advertiser filter-rate parity stats
- **TRUST-04**: "LankaReview Insiders" community program (Elite equivalent) — nomination council, no-payment/no-AI-drafted-review rules, public badge, partner-venue meetup perks

### Data & AI (Phase 6)

- **API-01**: Public read-only API (business search, business detail, reviews, categories, autocomplete) with free + paid rate-limited tiers
- **AI-01**: AI voice-agent call answering add-on (Sinhala/Tamil/English) leveraging existing AgentOS voice-agent stack
- **REC-01**: Personalization/recommendation engine — start with co-occurrence, defer ML recommender until sufficient data volume

### Commerce

- **DEAL-01**: Deals & gift certificates — escrowed consumer payment, QR/numeric voucher redemption, commission charged only on redemption (needs Phase 2 payment rails first)

## Out of Scope

Explicitly excluded from the near-term roadmap (not the same as "later phase" above).

| Feature | Reason |
|---------|--------|
| Multi-location/enterprise console (spec 7.9) | Low priority per spec — build only once chain customers actually ask |
| Bespoke ML ranking model (spec 6.1) | Spec explicitly warns against building this before tens of thousands of searches of real data exist |
| Full collaborative-filtering recommender (spec 6.4) | Same reasoning — start with simple co-occurrence only, and only once Phase 6 is reached |
| Paid data-licensing API tier (spec 10.4) | Don't sell data access before real listing density exists — premature per spec |

## Traceability

Roadmap phases below are the authoritative breakdown from `/gsd-roadmapper` (see ROADMAP.md).
Phases 1-5 are vertical MVP slices of the 33 v1 requirements (milestone v1.0, Consumer MVP).
Phases 6-10 are the sequential breakdown of the 37 v2.0 "Yelp Parity Redesign" requirements,
continuing this project's own phase numbering from Phase 5 (not to be confused with the spec's
own internal `spec Phase N` labels used below for the separately-tracked, not-yet-roadmapped
"v2 Requirements" section — those remain deferred labels only, not part of any milestone's
roadmap yet).

| Requirement | Phase | Status |
|-------------|-------|--------|
| LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06 | Phase 1 | Pending |
| LOC-02 | Phase 1 | Complete |
| SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, SRCH-06 | Phase 2 | Pending |
| AUTH-01, AUTH-02, AUTH-03 | Phase 2 | Pending |
| LOC-01 | Phase 2 | Complete |
| REV-01, REV-02, REV-03, REV-06 | Phase 3 (backend chunk) | Complete |
| REV-04, REV-05 | Phase 3 (UI chunk) | Complete |
| MOD-01 | Phase 3 | Complete |
| VOTE-01, VOTE-02 | Phase 4 | Complete |
| CLAIM-01 | Phase 4 | Complete |
| MOD-02 | Phase 4 | Complete |
| PHOTO-01, PHOTO-02 | Phase 5 | Complete |
| QA-01 | Phase 5 | Complete |
| COLL-01, COLL-02 | Phase 5 | Complete |
| DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10 | Phase 6 | Pending |
| DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-07, DESIGN-08, DESIGN-09 | Phase 7 | Pending |
| HOME-01, HOME-02, HOME-03, HOME-04, SEARCHUI-01, SEARCHUI-02, SEARCHUI-03 | Phase 8 | Pending |
| BIZPAGE-01, BIZPAGE-02, BIZPAGE-03, BIZPAGE-04, BIZPAGE-05, WRITEREV-01 | Phase 9 | Pending |
| LOGINUI-01, LOGINUI-02, LOGINUI-03, CLAIMUI-01, STUB-01 | Phase 10 | Pending |
| BIZ-01, BIZ-02 | v2 (spec Phase 2) | Deferred |
| ADS-01, ADS-02 | v2 (spec Phase 2) | Deferred |
| SUB-01, SUB-02 | v2 (spec Phase 2) | Deferred |
| RSV-01, RSV-02 | v2 (spec Phase 3) | Deferred |
| LEAD-01, LEAD-02 | v2 (spec Phase 4) | Deferred |
| TRUST-01, TRUST-02, TRUST-03, TRUST-04 | v2 (spec Phase 5) | Deferred |
| API-01, AI-01, REC-01 | v2 (spec Phase 6) | Deferred |
| DEAL-01 | v2 (spec Phase 2+) | Deferred |

**Coverage:**

- v1 requirements: 33 total (corrected from the initial definition pass's count of 30 —
  every individually-listed `XXX-NN` id above was recounted directly)

- Mapped to roadmap phases: 33
- Unmapped: 0 ✓

- v2.0 "Yelp Parity Redesign" requirements: 37 total (DATA-01..10, DESIGN-01..09,
  HOME-01..04, SEARCHUI-01..03, BIZPAGE-01..05, WRITEREV-01, LOGINUI-01..03, CLAIMUI-01,
  STUB-01)

- Mapped to roadmap phases: 37
- Unmapped: 0 ✓

**Per-phase counts:** Phase 1: 7 · Phase 2: 10 · Phase 3: 7 · Phase 4: 4 · Phase 5: 5 ·
Phase 6: 10 · Phase 7: 9 · Phase 8: 7 · Phase 9: 6 · Phase 10: 5

---
*Requirements defined: 2026-09-13*
*Last updated: 2026-09-24 — v2.0 "Yelp Parity Redesign" roadmap created; Phases 6-10 added,
37/37 v2.0 requirements mapped (Pending). v1 mappings (Phases 1-5) unchanged.*
