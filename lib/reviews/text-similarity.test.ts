import { describe, expect, it } from "vitest";
import { jaccardTrigramSimilarity, maxSimilarity } from "./text-similarity";

describe("jaccardTrigramSimilarity", () => {
  it("returns 1 for identical text", () => {
    expect(jaccardTrigramSimilarity("Great food and service", "Great food and service")).toBe(1);
  });

  it("returns a high score for near-identical templated text", () => {
    const score = jaccardTrigramSimilarity(
      "Amazing place, five stars, would recommend to everyone I know!",
      "Amazing place, five stars, would recommend to everyone I know.",
    );
    expect(score).toBeGreaterThan(0.9);
  });

  it("returns a low score for unrelated text", () => {
    const score = jaccardTrigramSimilarity(
      "The staff were friendly and the food arrived quickly.",
      "Parking was difficult to find near this hardware store.",
    );
    expect(score).toBeLessThan(0.3);
  });

  it("returns 0 when either input is empty", () => {
    expect(jaccardTrigramSimilarity("", "something")).toBe(0);
  });
});

describe("maxSimilarity", () => {
  it("returns the highest similarity across all comparison texts", () => {
    const result = maxSimilarity("Great food and service", [
      "Parking was difficult to find near this hardware store.",
      "Great food and service",
    ]);
    expect(result).toBe(1);
  });

  it("returns 0 for an empty comparison list", () => {
    expect(maxSimilarity("anything", [])).toBe(0);
  });
});
