import { describe, expect, it } from "vitest";
import { sortAnswers } from "./sort-answers";

describe("sortAnswers", () => {
  it("puts the highest voteCount first", () => {
    const sorted = sortAnswers([
      { id: "a", voteCount: 1, createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "b", voteCount: 4, createdAt: "2026-01-02T00:00:00.000Z" },
      { id: "c", voteCount: 2, createdAt: "2026-01-03T00:00:00.000Z" },
    ]);
    expect(sorted.map((row) => row.id)).toEqual(["b", "c", "a"]);
  });

  it("breaks vote ties by earlier createdAt", () => {
    const sorted = sortAnswers([
      { id: "later", voteCount: 3, createdAt: "2026-02-01T00:00:00.000Z" },
      { id: "earlier", voteCount: 3, createdAt: "2026-01-01T00:00:00.000Z" },
    ]);
    expect(sorted.map((row) => row.id)).toEqual(["earlier", "later"]);
  });
});
