import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { runSearchQuery, SEARCH_PAGE_SIZE } from "./run-search-query";

// This test suite creates and tears down its own `test-search-*`-slugged
// fixture businesses — it never depends on or mutates the 107-row seed
// dataset. Every filter/category used below is a made-up, uniquely-named
// value (e.g. "zzztest-restaurant-cat") so assertions are never polluted by
// coincidental matches in the real seed data, and every free-text query uses
// an invented word that cannot appear in real business names/descriptions.
const SLUG_PREFIX = "test-search-";

const COLOMBO_03 = { lat: 6.9147, lng: 79.8489 };
const COLOMBO_04 = { lat: 6.8905, lng: 79.857 };
const NUGEGODA = { lat: 6.8686, lng: 79.8899 };

interface FixtureBusiness {
  slug: string;
  name: string;
  description: string;
  primaryCategories: string[];
  secondaryCategories?: string[];
  district: string;
  addressFreeText: string;
  latitude: number;
  longitude: number;
  attributes: Prisma.InputJsonValue;
}

const CAT_RESTAURANT = "zzztest-restaurant-cat";
const CAT_GROCERY = "zzztest-grocery-cat";
const CAT_SORT = "zzztest-sortcat";
const CAT_NAMESORT = "zzztest-namesort-cat";
const CAT_FALLBACK = "zzztest-fallback-cat";
const CAT_OPENNOW = "zzztest-opennow-cat";

const fixtures: FixtureBusiness[] = [
  // Category / price-tier AND-semantics fixtures.
  {
    slug: `${SLUG_PREFIX}kottu-palace`,
    name: "Test Search Kottu Palace",
    description: "Rice, curry, and kottu roti served daily.",
    primaryCategories: [CAT_RESTAURANT],
    district: "Colombo 03",
    addressFreeText: "1 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
  {
    slug: `${SLUG_PREFIX}curry-house`,
    name: "Test Search Curry House",
    description: "Traditional Sri Lankan rice and curry buffet.",
    primaryCategories: [CAT_RESTAURANT],
    district: "Colombo 04",
    addressFreeText: "2 Test Lane",
    latitude: COLOMBO_04.lat,
    longitude: COLOMBO_04.lng,
    attributes: { priceTier: 3 },
  },
  {
    slug: `${SLUG_PREFIX}pizza-corner`,
    name: "Test Search Pizza Corner",
    description: "Wood-fired pizza and pasta.",
    primaryCategories: [CAT_RESTAURANT],
    district: "Nugegoda",
    addressFreeText: "3 Test Lane",
    latitude: NUGEGODA.lat,
    longitude: NUGEGODA.lng,
    attributes: { priceTier: 1 },
  },
  {
    slug: `${SLUG_PREFIX}grocery-mart`,
    name: "Test Search Grocery Mart",
    description: "Everyday groceries and household essentials.",
    primaryCategories: [CAT_GROCERY],
    district: "Colombo 03",
    addressFreeText: "4 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 1 },
  },
  // Text-relevance / distance-sort fixtures — both match the invented word
  // "bravinoxa", one in the name (tsvector weight A), one only in the
  // description (weight B), placed at different distances from COLOMBO_03.
  {
    slug: `${SLUG_PREFIX}bravinoxa-one`,
    name: "Test Search Bravinoxa One",
    description: "A small neighborhood cafe.",
    primaryCategories: [CAT_SORT],
    district: "Nugegoda",
    addressFreeText: "5 Test Lane",
    latitude: NUGEGODA.lat,
    longitude: NUGEGODA.lng,
    attributes: { priceTier: 2 },
  },
  {
    slug: `${SLUG_PREFIX}plain-cafe`,
    name: "Test Search Plain Cafe",
    description: "Famous for its bravinoxa pastries and coffee.",
    primaryCategories: [CAT_SORT],
    district: "Colombo 03",
    addressFreeText: "6 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
  // Deterministic name-order fixtures (highest_rated / most_reviewed).
  {
    slug: `${SLUG_PREFIX}gamma-diner`,
    name: "Test Search Gamma Diner",
    description: "A diner.",
    primaryCategories: [CAT_NAMESORT],
    district: "Colombo 03",
    addressFreeText: "7 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
  {
    slug: `${SLUG_PREFIX}alpha-diner`,
    name: "Test Search Alpha Diner",
    description: "A diner.",
    primaryCategories: [CAT_NAMESORT],
    district: "Colombo 03",
    addressFreeText: "8 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
  {
    slug: `${SLUG_PREFIX}beta-diner`,
    name: "Test Search Beta Diner",
    description: "A diner.",
    primaryCategories: [CAT_NAMESORT],
    district: "Colombo 03",
    addressFreeText: "9 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
  // pg_trgm fallback fixture — short, single-word name for a reliable
  // trigram similarity score against a one-character-dropped typo query.
  {
    slug: `${SLUG_PREFIX}vexonflorp`,
    name: "Vexonflorp",
    description: "A test fixture business.",
    primaryCategories: [CAT_FALLBACK],
    district: "Colombo 03",
    addressFreeText: "10 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
  // Open-now fixtures (Task 3) — anchored to the real Asia/Colombo clock at
  // fixture-creation time so this suite works regardless of what day/time
  // it runs: an overnight (crossesMidnight) shift that started yesterday
  // and is still active "now", and a same-day shift that already ended a
  // safe multi-hour margin in the past.
  {
    slug: `${SLUG_PREFIX}open-overnight-diner`,
    name: "Test Search Open Overnight Diner",
    description: "Open late, every night.",
    primaryCategories: [CAT_OPENNOW],
    district: "Colombo 03",
    addressFreeText: "11 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
  {
    slug: `${SLUG_PREFIX}closed-early-diner`,
    name: "Test Search Closed Early Diner",
    description: "Breakfast only, closes early.",
    primaryCategories: [CAT_OPENNOW],
    district: "Colombo 03",
    addressFreeText: "12 Test Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
  },
];

function fixtureId(slugSuffix: string, ids: Map<string, string>): string {
  const id = ids.get(`${SLUG_PREFIX}${slugSuffix}`);
  if (!id) throw new Error(`fixture not found: ${slugSuffix}`);
  return id;
}

const idBySlug = new Map<string, string>();

beforeAll(async () => {
  for (const fixture of fixtures) {
    const created = await prisma.business.create({ data: { ...fixture } });
    idBySlug.set(fixture.slug, created.id);
  }

  // Open-now fixtures: computed relative to the real current Asia/Colombo
  // time at fixture-creation time (matching lib/hours/compute-open-now.ts's
  // own hardcoded ZONE). "Open Overnight Diner" gets a shift that started
  // yesterday at 18:00 and runs through 09:00 today (crossesMidnight) — a
  // multi-hour safety margin either side of "now" for this suite's runtime.
  // "Closed Early Diner" gets a same-day shift that ended hours ago.
  const now = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = now.formatToParts(new Date());
  const weekdayShort = parts.find((p) => p.type === "weekday")?.value ?? "Tue";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const todayDow = weekdayMap[weekdayShort] ?? 2;
  const yesterdayDow = (todayDow + 6) % 7;

  const openOvernightId = fixtureId("open-overnight-diner", idBySlug);
  const closedEarlyId = fixtureId("closed-early-diner", idBySlug);

  await prisma.businessHours.create({
    data: {
      businessId: openOvernightId,
      dayOfWeek: yesterdayDow,
      openTime: "18:00",
      closeTime: "09:00",
      crossesMidnight: true,
    },
  });
  await prisma.businessHours.create({
    data: {
      businessId: closedEarlyId,
      dayOfWeek: todayDow,
      openTime: "00:00",
      closeTime: "03:00",
      crossesMidnight: false,
    },
  });
});

afterAll(async () => {
  await prisma.business.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
});

describe("runSearchQuery — text relevance (SRCH-01)", () => {
  it("returns a tsvector-matching business for its own unique query word", async () => {
    const result = await runSearchQuery({
      textQuery: "kottu",
      categories: [CAT_RESTAURANT],
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    expect(slugs).toContain(`${SLUG_PREFIX}kottu-palace`);
  });

  it("returns an empty result for a query matching zero tsvector rows and zero trigram-similar names", async () => {
    const result = await runSearchQuery({
      textQuery: "nonexistentquerytoken999",
      categories: [CAT_RESTAURANT, CAT_GROCERY, CAT_SORT, CAT_NAMESORT, CAT_FALLBACK],
      sort: "recommended",
      page: 1,
    });
    expect(result.businesses).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("falls back to a pg_trgm similarity pass against name when the tsvector pass finds zero rows", async () => {
    const result = await runSearchQuery({
      textQuery: "vexonflop", // one character dropped from "Vexonflorp"
      categories: [CAT_FALLBACK],
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    expect(slugs).toContain(`${SLUG_PREFIX}vexonflorp`);
  });

  it("never executes an adversarial SQL fragment passed as search text", async () => {
    const beforeCount = await prisma.business.count();

    await expect(
      runSearchQuery({
        textQuery: `'; DROP TABLE "Business"; --`,
        categories: [CAT_RESTAURANT],
        sort: "recommended",
        page: 1,
      }),
    ).resolves.toBeDefined();

    const afterCount = await prisma.business.count();
    expect(afterCount).toBe(beforeCount);
  });
});

describe("runSearchQuery — filter composition (SRCH-03)", () => {
  it("matches the category filter against primaryCategories/secondaryCategories", async () => {
    const result = await runSearchQuery({
      categories: [CAT_GROCERY],
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug).sort();
    expect(slugs).toEqual([`${SLUG_PREFIX}grocery-mart`]);
  });

  it("matches the priceTiers filter against attributes.priceTier", async () => {
    const result = await runSearchQuery({
      categories: [CAT_RESTAURANT],
      priceTiers: [1],
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    expect(slugs).toEqual([`${SLUG_PREFIX}pizza-corner`]);
  });

  it("composes category AND priceTiers filters together (AND semantics)", async () => {
    const result = await runSearchQuery({
      categories: [CAT_RESTAURANT],
      priceTiers: [2],
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    expect(slugs).toEqual([`${SLUG_PREFIX}kottu-palace`]);
  });

  it("returns all matching category rows when priceTiers is not restrictive", async () => {
    const result = await runSearchQuery({
      categories: [CAT_RESTAURANT],
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug).sort();
    expect(slugs).toEqual(
      [`${SLUG_PREFIX}curry-house`, `${SLUG_PREFIX}kottu-palace`, `${SLUG_PREFIX}pizza-corner`].sort(),
    );
  });
});

describe("runSearchQuery — sort options (SRCH-04/SRCH-05)", () => {
  it("sort=recommended ranks a name-weighted (A) text match above a description-only (B) match, with no origin", async () => {
    const result = await runSearchQuery({
      textQuery: "bravinoxa",
      categories: [CAT_SORT],
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    expect(slugs).toEqual([`${SLUG_PREFIX}bravinoxa-one`, `${SLUG_PREFIX}plain-cafe`]);
  });

  it("sort=distance without an origin falls back to recommended ordering", async () => {
    const result = await runSearchQuery({
      textQuery: "bravinoxa",
      categories: [CAT_SORT],
      sort: "distance",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    expect(slugs).toEqual([`${SLUG_PREFIX}bravinoxa-one`, `${SLUG_PREFIX}plain-cafe`]);
    expect(result.businesses.every((b) => b.distanceKm === null)).toBe(true);
  });

  it("sort=distance with an origin orders strictly by distanceKm ascending, overriding text relevance", async () => {
    const result = await runSearchQuery({
      textQuery: "bravinoxa",
      categories: [CAT_SORT],
      originLat: COLOMBO_03.lat,
      originLng: COLOMBO_03.lng,
      sort: "distance",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    // "Plain Cafe" sits at the origin (~0km); "Bravinoxa One" is in
    // Nugegoda (~9km away) — distance sort reverses the recommended order.
    expect(slugs).toEqual([`${SLUG_PREFIX}plain-cafe`, `${SLUG_PREFIX}bravinoxa-one`]);
    const distances = result.businesses.map((b) => b.distanceKm ?? -1);
    expect(distances[0]).toBeLessThan(distances[1]);
  });

  it("sort=highest_rated produces a stable name-ASC order", async () => {
    const result = await runSearchQuery({
      categories: [CAT_NAMESORT],
      sort: "highest_rated",
      page: 1,
    });
    const names = result.businesses.map((b) => b.name);
    expect(names).toEqual([
      "Test Search Alpha Diner",
      "Test Search Beta Diner",
      "Test Search Gamma Diner",
    ]);
  });

  it("sort=most_reviewed produces the same stable name-ASC order", async () => {
    const result = await runSearchQuery({
      categories: [CAT_NAMESORT],
      sort: "most_reviewed",
      page: 1,
    });
    const names = result.businesses.map((b) => b.name);
    expect(names).toEqual([
      "Test Search Alpha Diner",
      "Test Search Beta Diner",
      "Test Search Gamma Diner",
    ]);
  });
});

describe("runSearchQuery — pagination", () => {
  it("respects SEARCH_PAGE_SIZE and reports totalCount/totalPages", async () => {
    const result = await runSearchQuery({
      categories: [CAT_RESTAURANT],
      sort: "recommended",
      page: 1,
    });
    expect(result.totalCount).toBe(3);
    expect(result.totalPages).toBe(1);
    expect(result.businesses.length).toBeLessThanOrEqual(SEARCH_PAGE_SIZE);
  });
});

describe("runSearchQuery — open-now application-layer post-filter (SRCH-03, Task 3)", () => {
  it("includes an overnight shift still active now and excludes a shift that already ended today", async () => {
    const result = await runSearchQuery({
      categories: [CAT_OPENNOW],
      openNow: true,
      sort: "recommended",
      page: 1,
    });
    const slugs = result.businesses.map((b) => b.slug);
    expect(slugs).toContain(`${SLUG_PREFIX}open-overnight-diner`);
    expect(slugs).not.toContain(`${SLUG_PREFIX}closed-early-diner`);
  });

  it("recomputes totalCount/totalPages against the post-filter (open-only) count, not the pre-filter SQL count", async () => {
    const withoutFilter = await runSearchQuery({
      categories: [CAT_OPENNOW],
      sort: "recommended",
      page: 1,
    });
    expect(withoutFilter.totalCount).toBe(2);

    const withFilter = await runSearchQuery({
      categories: [CAT_OPENNOW],
      openNow: true,
      sort: "recommended",
      page: 1,
    });
    expect(withFilter.totalCount).toBe(1);
    expect(withFilter.totalPages).toBe(1);
  });

  it("fetches hours/overrides for the whole candidate set in exactly one findMany call (no N+1)", async () => {
    const spy = vi.spyOn(prisma.business, "findMany");

    await runSearchQuery({
      categories: [CAT_OPENNOW],
      openNow: true,
      sort: "recommended",
      page: 1,
    });

    const hoursCalls = spy.mock.calls.filter(([args]) => {
      const include = (args as { include?: { hours?: unknown } } | undefined)?.include;
      return include?.hours === true;
    });
    expect(hoursCalls).toHaveLength(1);

    spy.mockRestore();
  });
});
