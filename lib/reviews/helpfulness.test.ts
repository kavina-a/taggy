import { describe, expect, it } from "vitest";
import { computeHelpfulnessScore } from "./sort-reviews";

describe("computeHelpfulnessScore", () => {
  it("returns 0 when a review has no votes", () => {
    expect(computeHelpfulnessScore({ usefulCount: 0, funnyCount: 0, coolCount: 0 })).toBe(0);
  });

  it("weights Useful above Funny and Cool", () => {
    const usefulOnly = computeHelpfulnessScore({
      usefulCount: 4,
      funnyCount: 0,
      coolCount: 0,
    });
    const funnyCool = computeHelpfulnessScore({
      usefulCount: 0,
      funnyCount: 4,
      coolCount: 0,
    });
    expect(usefulOnly).toBeGreaterThan(funnyCool);
  });

  it("caps at 1.0 so a viral review cannot fully drown recency", () => {
    expect(
      computeHelpfulnessScore({ usefulCount: 10_000, funnyCount: 0, coolCount: 0 }),
    ).toBe(1);
  });
});
