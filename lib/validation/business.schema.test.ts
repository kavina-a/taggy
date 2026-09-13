import { describe, expect, it } from "vitest";
import { businessSeedSchema } from "./business.schema";

const validBusiness = {
  slug: "test-cafe",
  name: "Test Cafe",
  description: "A cozy cafe in Colombo 07.",
  primaryCategories: ["restaurant"],
  secondaryCategories: [],
  district: "Colombo 07",
  addressFreeText: "123 Test Road, Colombo 07",
  latitude: 6.9147,
  longitude: 79.8607,
  attributes: {},
};

describe("businessSeedSchema", () => {
  it("parses a valid business record", () => {
    expect(() => businessSeedSchema.parse(validBusiness)).not.toThrow();
  });

  it("rejects more than 3 primary categories", () => {
    const invalid = {
      ...validBusiness,
      primaryCategories: ["restaurant", "cafe", "bakery", "bar"],
    };
    expect(() => businessSeedSchema.parse(invalid)).toThrow();
  });

  it("rejects zero primary categories", () => {
    const invalid = { ...validBusiness, primaryCategories: [] };
    expect(() => businessSeedSchema.parse(invalid)).toThrow();
  });

  it("rejects an extra unrecognized key (e.g. zip) via strict schema", () => {
    const invalid = { ...validBusiness, zip: "00100" };
    expect(() => businessSeedSchema.parse(invalid)).toThrow();
  });

  it("rejects latitude outside [-90, 90]", () => {
    const invalid = { ...validBusiness, latitude: 91 };
    expect(() => businessSeedSchema.parse(invalid)).toThrow();
  });

  it("rejects longitude outside [-180, 180]", () => {
    const invalid = { ...validBusiness, longitude: -181 };
    expect(() => businessSeedSchema.parse(invalid)).toThrow();
  });
});
