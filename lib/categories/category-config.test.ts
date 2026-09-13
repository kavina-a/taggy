import { describe, expect, it } from "vitest";
import { attributeSchemaByCategory, categoryTaxonomy } from "./category-config";

// Sri Lanka-specific leaf categories per LIST-05 / CONTEXT.md D-04.
const SL_SPECIFIC_SLUGS = ["tuk-repair", "tutoring", "wedding-vendors", "tailoring"];

function allLeafSlugs(): string[] {
  return categoryTaxonomy.flatMap((group) => group.categories.map((c) => c.slug));
}

describe("category-config", () => {
  it("includes all 4 Sri Lanka-specific leaf slugs somewhere in categoryTaxonomy", () => {
    const slugs = allLeafSlugs();
    for (const slug of SL_SPECIFIC_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  it("has a matching attributeSchemaByCategory entry for every leaf slug (no orphans)", () => {
    const slugs = allLeafSlugs();
    for (const slug of slugs) {
      expect(attributeSchemaByCategory[slug]).toBeDefined();
    }
  });

  it("restaurant schema accepts a fully valid restaurant attribute set", () => {
    const result = attributeSchemaByCategory.restaurant.safeParse({
      delivery: true,
      takeout: true,
      dineIn: true,
      outdoorSeating: false,
      goodForGroups: true,
      goodForKids: false,
      alcoholServed: false,
      reservationsAccepted: true,
      priceTier: 2,
      wifi: true,
    });
    expect(result.success).toBe(true);
  });

  it("restaurant schema rejects an out-of-range priceTier", () => {
    const result = attributeSchemaByCategory.restaurant.safeParse({ priceTier: 7 });
    expect(result.success).toBe(false);
  });

  it("home-services schema accepts a minimal valid attribute set", () => {
    const result = attributeSchemaByCategory["home-services"].safeParse({
      licenseVerified: true,
      freeEstimates: true,
    });
    expect(result.success).toBe(true);
  });

  it("tuk-repair schema rejects unknown keys (strict)", () => {
    const result = attributeSchemaByCategory["tuk-repair"].safeParse({
      notARealKey: 1,
    });
    expect(result.success).toBe(false);
  });
});
