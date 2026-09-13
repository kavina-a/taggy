<!-- GSD:project-start source:PROJECT.md -->

## Project

**LankaReview**

A two-sided local marketplace for Sri Lanka — "Yelp for Sri Lanka." Consumers search,
browse, and read crowd-sourced reviews/photos/ratings of local businesses to decide
where to eat, shop, or hire a service, for free. Businesses get a free listing page and
pay for paid placement/ads, SaaS tools (reservations, waitlist, leads), and enhanced
profile features. Launch vertical is restaurants & food in Colombo, expanding city by
city and into home & local services.

**Core Value:** The free consumer review/search product must stay trustworthy and useful — that trust is
the asset every business-side revenue stream (ads, SaaS, subscriptions) is sold against.
If monetization ever degrades review-corpus quality or search trust, the whole model fails.

### Constraints

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
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
