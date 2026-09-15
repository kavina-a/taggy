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

- [ ] **SRCH-01**: Search bar (free-text "what" + geo "where", defaulting to detected location) returns ranked business results
- [ ] **SRCH-02**: Results page shows business cards (photo, name, category, price tier, rating+count, distance, snippet, open/closed badge) plus a map with pins
- [ ] **SRCH-03**: Filters: category, price tier, open now, distance radius, rating threshold, category-conditional attributes
- [ ] **SRCH-04**: Sort options: Recommended (default), Highest Rated, Most Reviewed, Distance
- [ ] **SRCH-05**: "Recommended" sort blends text/category relevance, geo-decay, and a Bayesian/Wilson-score-adjusted rating (never a naive average) — implemented so a future ad-auction layer can interleave without touching this score (spec 6.1)
- [ ] **SRCH-06**: Home/discovery page shows rails (trending near you, top rated this month, new businesses, category shortcuts)

### Reviews

- [ ] **REV-01**: Logged-in user can write one review per business (rating 1-5 required first, then text with enforced minimum length, optional photos) — DB-level unique constraint on (user, business)
- [ ] **REV-02**: User can edit their own review at any time; edits re-run the review filter
- [ ] **REV-03**: Every review runs synchronously through a rules-based filter at publish time, setting `visibility_status` to `recommended` or `not_recommended` — the author is never told in real time whether they were filtered (spec 6.3)
- [ ] **REV-04**: Filtered ("not_recommended") reviews remain readable via an explicit "X reviews not currently recommended" disclosure link and are excluded only from the public average/default view, never deleted or hidden without access
- [ ] **REV-05**: Default review display order blends recency, reviewer credibility (account history), and helpfulness votes — with explicit Newest/Highest/Lowest override always available (spec 6.2)
- [ ] **REV-06**: Review filter logic logs enough data (reviewer history signals, burst/timing, text-similarity) to support a future advertiser-parity audit, even before any advertisers exist

### Voting & Owner Response

- [ ] **VOTE-01**: Reviews support three independent toggle vote types: Useful, Funny, Cool
- [ ] **VOTE-02**: A claimed business's verified owner can post exactly one public response per review, labeled "Response from the owner"

### Photos & Q&A

- [ ] **PHOTO-01**: Any logged-in user can upload a photo to a business page (not just reviewers)
- [ ] **PHOTO-02**: Uploaded photos run through basic automated moderation (NSFW/irrelevance) before going live
- [ ] **QA-01**: Any user can post a question on a business page; any user (including the owner) can answer; answers are votable and the top-voted answer surfaces first

### Collections

- [ ] **COLL-01**: Logged-in user can save a business to a default "My Saved Places" list or a named list
- [ ] **COLL-02**: Collections can be made public with a shareable link

### Auth

- [x] **AUTH-01**: Consumer signup/login via phone OTP (primary) with optional email
- [ ] **AUTH-02**: Guest browsing is fully supported — no login required to search, browse, or read reviews; login required only to write reviews, message, or bookmark
- [ ] **AUTH-03**: Progressive profile — signup does not require a full profile before browsing

### Moderation (basic)

- [ ] **MOD-01**: Real-time profanity/hate-speech/PII classifier runs on every review and photo before publish
- [ ] **MOD-02**: One-tap Report/Flag on any review, photo, or business with a reason picker; reporter gets confirmation only, no visibility into outcome

### Business Claim (minimal, owner-response only)

- [ ] **CLAIM-01**: A business owner can claim an unclaimed (or create a new) listing via phone-OTP verification to the listed number — sufficient to unlock owner-response rights; full Business Registration document verification and multi-staff logins are v2 (spec 7.1)

### Localization

- [x] **LOC-01**: `language_pref` field exists on user accounts (en|si|ta) and drives a language switcher; English ships complete for v1, Sinhala/Tamil structurally supported for incremental translation
- [x] **LOC-02**: Address model uses district/DS-division + free text + lat/lng as source of truth, never a US-style ZIP/postal search

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

Roadmap phases below are the authoritative breakdown from `/gsd-roadmapper` (see ROADMAP.md),
derived as vertical MVP slices of the 33 v1 requirements. v2 requirements retain the spec's own
Section 18 phase numbering as a label only (`spec Phase N`) — they are not part of this
milestone's roadmap and are not yet assigned to concrete roadmap phases.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06 | Phase 1 | Pending |
| LOC-02 | Phase 1 | Complete |
| SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, SRCH-06 | Phase 2 | Pending |
| AUTH-01, AUTH-02, AUTH-03 | Phase 2 | Pending |
| LOC-01 | Phase 2 | Complete |
| REV-01, REV-02, REV-03, REV-04, REV-05, REV-06 | Phase 3 | Pending |
| MOD-01 | Phase 3 | Pending |
| VOTE-01, VOTE-02 | Phase 4 | Pending |
| CLAIM-01 | Phase 4 | Pending |
| MOD-02 | Phase 4 | Pending |
| PHOTO-01, PHOTO-02 | Phase 5 | Pending |
| QA-01 | Phase 5 | Pending |
| COLL-01, COLL-02 | Phase 5 | Pending |
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

**Per-phase counts:** Phase 1: 7 · Phase 2: 10 · Phase 3: 7 · Phase 4: 4 · Phase 5: 5

---
*Requirements defined: 2026-09-13*
*Last updated: 2026-09-13 after roadmap creation — traceability reconciled against ROADMAP.md's 5-phase breakdown; requirement count corrected to 33*
