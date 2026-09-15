import { describe, expect, it } from "vitest";
import { geoDecayScore } from "./geo-decay";
import {
  districtCentroids,
  findNearestDistrict,
  lookupDistrictCentroid,
} from "./district-centroids";
import { parseSearchParams, searchParamsSchema, sortOptionSchema } from "./search-params.schema";

describe("geoDecayScore", () => {
  it("returns 1.0 at distance 0 (within the default 1km offset)", () => {
    expect(geoDecayScore(0)).toBe(1.0);
  });

  it("returns 1.0 at exactly the default 1km offset", () => {
    expect(geoDecayScore(1)).toBe(1.0);
  });

  it("is approximately 0.5 at the offset + one scale unit (half-life point)", () => {
    // offsetKm=1, scaleKm=5 defaults -> half-life at distance 6km
    expect(geoDecayScore(6)).toBeCloseTo(0.5, 5);
  });

  it("is approximately 0.25 at two scale units past the offset", () => {
    expect(geoDecayScore(11)).toBeCloseTo(0.25, 5);
  });

  it("never returns a value outside [0, 1] for any non-negative distance", () => {
    for (const distance of [0, 0.5, 1, 2, 6, 11, 50, 1000, 100_000]) {
      const score = geoDecayScore(distance);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it("respects custom offsetKm/scaleKm arguments", () => {
    expect(geoDecayScore(2, 2, 10)).toBe(1.0);
    expect(geoDecayScore(12, 2, 10)).toBeCloseTo(0.5, 5);
  });
});

describe("sortOptionSchema", () => {
  it("accepts exactly the 4 documented sort options", () => {
    for (const option of ["recommended", "highest_rated", "most_reviewed", "distance"]) {
      expect(sortOptionSchema.parse(option)).toBe(option);
    }
  });

  it("rejects an unrecognized sort value", () => {
    expect(() => sortOptionSchema.parse("top_rated")).toThrow();
  });
});

describe("parseSearchParams", () => {
  it("applies sort=recommended and page=1 defaults when those keys are absent", () => {
    const result = parseSearchParams({});
    expect(result.sort).toBe("recommended");
    expect(result.page).toBe(1);
    expect(result.rating).toBe("any");
  });

  it("rejects an unrecognized query key", () => {
    expect(() => parseSearchParams({ unknownKey: "value" })).toThrow();
  });

  it("coerces lat/lng/page from URL-string form", () => {
    const result = parseSearchParams({ lat: "6.9147", lng: "79.8489", page: "2" });
    expect(result.lat).toBe(6.9147);
    expect(result.lng).toBe(79.8489);
    expect(result.page).toBe(2);
  });

  it("normalizes a repeated-key array value to its first entry", () => {
    const result = parseSearchParams({ find_desc: ["kottu", "curry"] });
    expect(result.find_desc).toBe("kottu");
  });

  it("rejects an out-of-range latitude", () => {
    expect(() => searchParamsSchema.parse({ lat: "999" })).toThrow();
  });
});

describe("districtCentroids", () => {
  it("covers exactly the 12 seeded district strings", () => {
    const districts = districtCentroids.map((c) => c.district);
    expect(districts).toEqual([
      "Colombo 01",
      "Colombo 02",
      "Colombo 03",
      "Colombo 04",
      "Colombo 05",
      "Colombo 06",
      "Colombo 07",
      "Colombo 08",
      "Colombo 09",
      "Colombo 10",
      "Dehiwala",
      "Nugegoda",
    ]);
  });
});

describe("findNearestDistrict", () => {
  it("returns each centroid itself when queried at its own coordinates", () => {
    for (const centroid of districtCentroids) {
      expect(findNearestDistrict(centroid.lat, centroid.lng).district).toBe(centroid.district);
    }
  });

  it("returns Colombo 03 for a point clearly closer to it than any other centroid", () => {
    // A few meters off Colombo 03's own centroid.
    expect(findNearestDistrict(6.915, 79.849).district).toBe("Colombo 03");
  });

  it("returns Nugegoda for a point clearly closer to it than any other centroid", () => {
    expect(findNearestDistrict(6.8688, 79.8897).district).toBe("Nugegoda");
  });
});

describe("lookupDistrictCentroid", () => {
  it('resolves "Colombo 03" to the Colombo 03 centroid', () => {
    expect(lookupDistrictCentroid("Colombo 03")?.district).toBe("Colombo 03");
  });

  it("is case-insensitive", () => {
    expect(lookupDistrictCentroid("colombo 03")?.district).toBe("Colombo 03");
  });

  it("returns null for an unmatched string", () => {
    expect(lookupDistrictCentroid("Kandy")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(lookupDistrictCentroid("")).toBeNull();
  });
});
