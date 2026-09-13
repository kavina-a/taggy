# Phase 1: Business Directory Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-13
**Phase:** 1-Business Directory Foundation
**Areas discussed:** Platform Surface, Category Attributes, Menu Representation, Seed Data Sourcing

---

## Platform Surface

| Option | Description | Selected |
|--------|-------------|----------|
| Web only | Build the Next.js (or similar) web app first; React Native comes in a later phase once the API is stable | ✓ |
| Web + mobile in parallel | Build both web and React Native against the same API from Phase 1 | |

**User's choice:** Web only
**Notes:** Recommended option chosen — no additional rationale given beyond accepting the recommendation.

---

## Category Attributes

| Option | Description | Selected |
|--------|-------------|----------|
| Flexible jsonb + per-category config | One jsonb column on businesses; a config maps category -> allowed attribute keys/types | ✓ |
| Fixed columns per category family | Dedicated typed columns for common attributes (e.g. has_delivery boolean) | |

**User's choice:** Flexible jsonb + per-category config
**Notes:** Recommended option chosen.

---

## Menu Representation

| Option | Description | Selected |
|--------|-------------|----------|
| Photos only for v1 | Menu tab = pinned photo gallery only, matching LIST-04's literal wording | ✓ |
| Structured menu items now | Build the MenuItem model (name/price/description/category) now | |

**User's choice:** Photos only for v1
**Notes:** Recommended option chosen. Structured MenuItem entity from the original spec's data model is explicitly deferred.

---

## Seed Data Sourcing

| Option | Description | Selected |
|--------|-------------|----------|
| Manually curated starter list | Hand-compile ~100-300 well-known Colombo businesses across the taxonomy | ✓ |
| OpenStreetMap export | Pull businesses from OSM's Sri Lanka data via Overpass API | |
| User provides seed data | User already has/will get a business list; Phase 1 just needs an import pipeline | |

**User's choice:** Manually curated starter list
**Notes:** Recommended option chosen.

---

## Claude's Discretion

- Exact web framework choice (e.g. Next.js), ORM/query layer, and physical storage of the
  per-category attribute config (JSON file vs. table) — left to research/planning.
- Exact seed dataset size (within ~100-300) and specific businesses chosen — left to
  Claude, guided by covering the full category taxonomy rather than clustering in one
  vertical.

## Deferred Ideas

- React Native mobile app — deferred past Phase 1.
- Structured `MenuItem` entity — deferred past v1, likely revisited alongside a future
  business-dashboard/menu-editing phase.
- OpenStreetMap-based or scraped seed data pipeline — not chosen now, worth revisiting if
  the manually-curated list needs to scale to other cities later.
