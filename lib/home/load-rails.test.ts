import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { loadRelatedBusinesses, loadTopRatedBusinesses } from "./load-rails";

// Fixture-creation/teardown convention matches lib/search/run-search-query.test.ts
// (SLUG_PREFIX, beforeAll create / afterAll deleteMany by slug prefix) — this
// suite never depends on or mutates the real seed dataset.
const SLUG_PREFIX = "test-rails-";
const COLOMBO_03 = { lat: 6.9147, lng: 79.8489 };
const CAT_RAILS = "zzztest-rails-cat";

interface FixtureBusiness {
  slug: string;
  name: string;
  description: string;
  primaryCategories: string[];
  district: string;
  addressFreeText: string;
  latitude: number;
  longitude: number;
  attributes: Prisma.InputJsonValue;
  avgRating?: number | null;
  reviewCount?: number;
  isTest?: boolean;
}

const fixtures: FixtureBusiness[] = [
  // Top-rated fixtures: the isTest:true business has the single highest
  // qualifying avgRating/reviewCount, so it would rank #1 if the isTest
  // filter were absent — a strong proof the filter is actually applied,
  // not just coincidentally absent from the result.
  {
    slug: `${SLUG_PREFIX}istest-top-rated`,
    name: "Test Rails IsTest Top Rated",
    description: "A test-fixture business that must never appear on the Top Rated rail.",
    primaryCategories: [CAT_RAILS],
    district: "Colombo 03",
    addressFreeText: "1 Test Rails Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
    avgRating: 5.0,
    reviewCount: 20,
    isTest: true,
  },
  {
    slug: `${SLUG_PREFIX}real-top-rated`,
    name: "Test Rails Real Top Rated",
    description: "A real (non-test) qualifying business, lower rating than the isTest fixture.",
    primaryCategories: [CAT_RAILS],
    district: "Colombo 03",
    addressFreeText: "2 Test Rails Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
    avgRating: 4.2,
    reviewCount: 10,
    isTest: false,
  },
  // Related-businesses fixtures: the target business and an isTest:true
  // business sharing the same category, plus a real business sharing it too.
  {
    slug: `${SLUG_PREFIX}related-target`,
    name: "Test Rails Related Target",
    description: "The business we ask for related businesses of.",
    primaryCategories: [CAT_RAILS],
    district: "Colombo 03",
    addressFreeText: "3 Test Rails Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
    isTest: false,
  },
  {
    slug: `${SLUG_PREFIX}istest-related`,
    name: "Test Rails IsTest Related",
    description: "A test-fixture business sharing the target's category.",
    primaryCategories: [CAT_RAILS],
    district: "Colombo 03",
    addressFreeText: "4 Test Rails Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
    isTest: true,
  },
  {
    slug: `${SLUG_PREFIX}real-related`,
    name: "Test Rails Real Related",
    description: "A real (non-test) business sharing the target's category.",
    primaryCategories: [CAT_RAILS],
    district: "Colombo 03",
    addressFreeText: "5 Test Rails Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    attributes: { priceTier: 2 },
    isTest: false,
  },
];

const idBySlug = new Map<string, string>();

beforeAll(async () => {
  for (const fixture of fixtures) {
    const created = await prisma.business.create({ data: { ...fixture } });
    idBySlug.set(fixture.slug, created.id);
  }
});

afterAll(async () => {
  await prisma.business.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
});

describe("loadTopRatedBusinesses — isTest exclusion (DATA-03)", () => {
  it("never returns an isTest:true business even with the single highest qualifying rating", async () => {
    const result = await loadTopRatedBusinesses();
    const slugs = result.map((b) => b.slug);
    expect(slugs).not.toContain(`${SLUG_PREFIX}istest-top-rated`);
  });

  it("still returns the real qualifying business", async () => {
    const result = await loadTopRatedBusinesses();
    const slugs = result.map((b) => b.slug);
    expect(slugs).toContain(`${SLUG_PREFIX}real-top-rated`);
  });
});

describe("loadRelatedBusinesses — isTest exclusion (DATA-03)", () => {
  it("never returns an isTest:true business even when it shares the target category", async () => {
    const targetId = idBySlug.get(`${SLUG_PREFIX}related-target`);
    if (!targetId) throw new Error("fixture not found: related-target");
    const result = await loadRelatedBusinesses(targetId, CAT_RAILS);
    const slugs = result.map((b) => b.slug);
    expect(slugs).not.toContain(`${SLUG_PREFIX}istest-related`);
    expect(slugs).toContain(`${SLUG_PREFIX}real-related`);
  });
});
