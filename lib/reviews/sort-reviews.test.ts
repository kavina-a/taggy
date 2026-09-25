import { describe, expect, it } from "vitest";
import { sortReviews, type SortableReview } from "./sort-reviews";

const NOW = new Date("2026-09-15T12:00:00.000Z");

function review(overrides: Partial<SortableReview> & { id: string }): SortableReview {
  return {
    rating: 3,
    createdAt: "2026-08-01T00:00:00.000Z",
    userAccountCreatedAt: "2026-01-01T00:00:00.000Z",
    userReviewCount: 1,
    usefulCount: 0,
    funnyCount: 0,
    coolCount: 0,
    ...overrides,
  };
}

describe("sortReviews", () => {
  it("newest: orders strictly by createdAt descending", () => {
    const reviews = [
      review({ id: "a", createdAt: "2026-09-01T00:00:00.000Z" }),
      review({ id: "b", createdAt: "2026-09-10T00:00:00.000Z" }),
      review({ id: "c", createdAt: "2026-08-01T00:00:00.000Z" }),
    ];

    const sorted = sortReviews(reviews, "newest", NOW);

    expect(sorted.map((r) => r.id)).toEqual(["b", "a", "c"]);
  });

  it("highest: orders by rating descending, ties broken by newest first", () => {
    const reviews = [
      review({ id: "a", rating: 3, createdAt: "2026-09-01T00:00:00.000Z" }),
      review({ id: "b", rating: 5, createdAt: "2026-09-05T00:00:00.000Z" }),
      review({ id: "c", rating: 5, createdAt: "2026-09-10T00:00:00.000Z" }),
    ];

    const sorted = sortReviews(reviews, "highest", NOW);

    // Both 5-star reviews come first (c newer than b), then the 3-star.
    expect(sorted.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });

  it("lowest: orders by rating ascending, ties broken by newest first", () => {
    const reviews = [
      review({ id: "a", rating: 5, createdAt: "2026-09-01T00:00:00.000Z" }),
      review({ id: "b", rating: 1, createdAt: "2026-09-05T00:00:00.000Z" }),
      review({ id: "c", rating: 1, createdAt: "2026-09-10T00:00:00.000Z" }),
    ];

    const sorted = sortReviews(reviews, "lowest", NOW);

    expect(sorted.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });

  it("blended: a recent, credible reviewer's review can outrank an older, brand-new reviewer's review despite a lower star rating", () => {
    const reviews = [
      review({
        id: "old-low-credibility",
        rating: 5,
        createdAt: "2025-10-01T00:00:00.000Z", // ~11.5 months old
        userAccountCreatedAt: "2026-09-14T00:00:00.000Z", // account made yesterday
        userReviewCount: 1,
      }),
      review({
        id: "recent-high-credibility",
        rating: 3,
        createdAt: "2026-09-14T00:00:00.000Z", // yesterday
        userAccountCreatedAt: "2024-01-01T00:00:00.000Z", // long-established account
        userReviewCount: 25,
      }),
    ];

    const sorted = sortReviews(reviews, "blended", NOW);

    expect(sorted.map((r) => r.id)).toEqual([
      "recent-high-credibility",
      "old-low-credibility",
    ]);
  });

  it("blended: is a pure function that never mutates its input array or review objects", () => {
    const reviews = [
      review({ id: "a", createdAt: "2026-09-01T00:00:00.000Z" }),
      review({ id: "b", createdAt: "2026-09-10T00:00:00.000Z" }),
    ];
    const snapshot = JSON.stringify(reviews);

    sortReviews(reviews, "blended", NOW);

    expect(JSON.stringify(reviews)).toBe(snapshot);
  });

  it("defaults to blended ordering when now is omitted", () => {
    const reviews = [
      review({ id: "a", createdAt: "2020-01-01T00:00:00.000Z" }),
      review({ id: "b", createdAt: new Date().toISOString() }),
    ];

    expect(() => sortReviews(reviews, "blended")).not.toThrow();
  });

  it("blended: a heavily-voted review outranks an otherwise identical unvoted review", () => {
    const reviews = [
      review({
        id: "unvoted",
        createdAt: "2026-09-01T00:00:00.000Z",
        usefulCount: 0,
      }),
      review({
        id: "voted",
        createdAt: "2026-09-01T00:00:00.000Z",
        usefulCount: 20,
      }),
    ];

    const sorted = sortReviews(reviews, "blended", NOW);

    expect(sorted.map((r) => r.id)).toEqual(["voted", "unvoted"]);
  });
});
