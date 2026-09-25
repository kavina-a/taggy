import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { findPublicBusinessId } from "./find-public-business";

// Fixture-creation/teardown convention matches lib/directory/load-directory-businesses.test.ts
// and lib/home/load-rails.test.ts — this suite never depends on or mutates
// the real seed dataset.
const SLUG_PREFIX = "test-findpublic-";
const COLOMBO_03 = { lat: 6.9147, lng: 79.8489 };
const CAT_FINDPUBLIC = "zzztest-findpublic-cat";

const istestFixture = {
  slug: `${SLUG_PREFIX}istest`,
  name: "Test FindPublic IsTest",
  description: "A test-fixture business that must never resolve via findPublicBusinessId.",
  primaryCategories: [CAT_FINDPUBLIC],
  district: "Colombo 03",
  addressFreeText: "1 Test FindPublic Lane",
  latitude: COLOMBO_03.lat,
  longitude: COLOMBO_03.lng,
  isTest: true,
};

const realFixture = {
  slug: `${SLUG_PREFIX}real`,
  name: "Test FindPublic Real",
  description: "A real (non-test) fixture business.",
  primaryCategories: [CAT_FINDPUBLIC],
  district: "Colombo 03",
  addressFreeText: "2 Test FindPublic Lane",
  latitude: COLOMBO_03.lat,
  longitude: COLOMBO_03.lng,
  isTest: false,
};

beforeAll(async () => {
  await prisma.business.create({ data: istestFixture });
  await prisma.business.create({ data: realFixture });
});

afterAll(async () => {
  await prisma.business.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
});

describe("findPublicBusinessId — isTest exclusion (DATA-03)", () => {
  it("resolves to null for an isTest:true slug even though the business exists", async () => {
    const result = await findPublicBusinessId(istestFixture.slug);
    expect(result).toBeNull();
  });

  it("resolves to { id } for a real isTest:false slug", async () => {
    const result = await findPublicBusinessId(realFixture.slug);
    expect(result).not.toBeNull();
    expect(typeof result?.id).toBe("string");
  });
});
