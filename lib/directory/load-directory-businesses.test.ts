import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { loadDirectoryBusinesses } from "./load-directory-businesses";

// Fixture-creation/teardown convention matches lib/search/run-search-query.test.ts
// and lib/home/load-rails.test.ts (SLUG_PREFIX, beforeAll create / afterAll
// deleteMany by slug prefix) — this suite never depends on or mutates the
// real seed dataset.
const SLUG_PREFIX = "test-directory-";
const COLOMBO_03 = { lat: 6.9147, lng: 79.8489 };
const CAT_DIRECTORY = "zzztest-directory-cat";

const fixtures = [
  {
    slug: `${SLUG_PREFIX}real-one`,
    name: "Test Directory Real One",
    description: "A real (non-test) fixture business.",
    primaryCategories: [CAT_DIRECTORY],
    district: "Colombo 03",
    addressFreeText: "1 Test Directory Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    isTest: false,
  },
  {
    slug: `${SLUG_PREFIX}real-two`,
    name: "Test Directory Real Two",
    description: "A second real (non-test) fixture business.",
    primaryCategories: [CAT_DIRECTORY],
    district: "Colombo 03",
    addressFreeText: "2 Test Directory Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    isTest: false,
  },
  {
    slug: `${SLUG_PREFIX}istest-fixture`,
    name: "Test Directory IsTest Fixture",
    description: "A test-fixture business that must never appear in /directory.",
    primaryCategories: [CAT_DIRECTORY],
    district: "Colombo 03",
    addressFreeText: "3 Test Directory Lane",
    latitude: COLOMBO_03.lat,
    longitude: COLOMBO_03.lng,
    isTest: true,
  },
];

beforeAll(async () => {
  for (const fixture of fixtures) {
    await prisma.business.create({ data: { ...fixture } });
  }
});

afterAll(async () => {
  await prisma.business.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
});

describe("loadDirectoryBusinesses — isTest exclusion (DATA-03)", () => {
  it("never returns an isTest:true business in the businesses array", async () => {
    const { businesses } = await loadDirectoryBusinesses(1, 100);
    const slugs = businesses.map((b) => b.slug);
    expect(slugs).not.toContain(`${SLUG_PREFIX}istest-fixture`);
    expect(slugs).toContain(`${SLUG_PREFIX}real-one`);
    expect(slugs).toContain(`${SLUG_PREFIX}real-two`);
  });

  it("never counts an isTest:true business toward totalCount", async () => {
    const countBefore = await prisma.business.count({
      where: { isTest: false, slug: { not: { startsWith: SLUG_PREFIX } } },
    });
    const { totalCount } = await loadDirectoryBusinesses(1, 100);
    // Real isTest:false rows (seed + any other fixture) plus exactly our 2
    // isTest:false fixtures — never the 3rd (isTest:true) fixture.
    expect(totalCount).toBe(countBefore + 2);
  });
});
