import { describe, expect, it } from "vitest";
import { classifyReview, type ReviewFilterSignals } from "./review-filter";

// REV-03/REV-06: rules-based review filter. Documented thresholds (see
// review-filter.ts's own comments for the canonical source of truth):
//   - "low reviewer history" (account <24h old OR this is their first-ever
//     review) is ONE weak signal, not two — a genuinely new user's honest
//     first review must still pass on its own.
//   - "burst posting" (>3 reviews across any business in the last hour) is
//     a second weak signal.
//   - "high text similarity" (>0.8 Jaccard-trigram vs. a prior review) is a
//     STRONG signal on its own.
//   - Decision: any 1 strong signal, OR 2+ weak signals, tips the review to
//     not_recommended. Otherwise recommended.
function baseSignals(overrides: Partial<ReviewFilterSignals> = {}): ReviewFilterSignals {
  return {
    accountAgeHours: 24 * 365,
    isFirstReview: false,
    priorReviewCount: 5,
    reviewsLastHour: 0,
    maxTextSimilarity: 0.1,
    ...overrides,
  };
}

describe("classifyReview", () => {
  it("recommends a clean review from an established user with no negative signals", () => {
    const result = classifyReview({ text: "Lovely spot, great service.", signals: baseSignals() });
    expect(result.visibilityStatus).toBe("recommended");
    expect(result.filterSignals.weakSignalCount).toBe(0);
    expect(result.filterSignals.strongSignalCount).toBe(0);
  });

  it("still recommends a brand-new account's honest first review when no other signals fire", () => {
    const result = classifyReview({
      text: "First time here, food was excellent and service was quick.",
      signals: baseSignals({ accountAgeHours: 1, isFirstReview: true, priorReviewCount: 0 }),
    });
    expect(result.visibilityStatus).toBe("recommended");
    // Low reviewer history is exactly ONE weak signal, even though both its
    // underlying conditions (new account AND first review) are true —
    // never double-counted into two signals for the same person.
    expect(result.filterSignals.weakSignalCount).toBe(1);
  });

  it("tips to not_recommended when a burst-posting pattern combines with a new account", () => {
    const result = classifyReview({
      text: "Amazing place, five stars, would recommend to everyone I know.",
      signals: baseSignals({ accountAgeHours: 2, priorReviewCount: 4, reviewsLastHour: 4 }),
    });
    expect(result.visibilityStatus).toBe("not_recommended");
    expect(result.filterSignals.weakSignalCount).toBe(2);
    expect(result.filterReason).toMatch(/burst/i);
  });

  it("tips to not_recommended on a high-text-similarity match even for an otherwise clean established user", () => {
    const result = classifyReview({
      text: "Copy-pasted review text here.",
      signals: baseSignals({ maxTextSimilarity: 0.92 }),
    });
    expect(result.visibilityStatus).toBe("not_recommended");
    expect(result.filterSignals.strongSignalCount).toBe(1);
    expect(result.filterReason).toMatch(/similar/i);
  });

  it("does not tip to not_recommended on a single weak signal alone (burst without new-account)", () => {
    const result = classifyReview({
      text: "Reviewing several places I visited today, this one was solid.",
      signals: baseSignals({ reviewsLastHour: 5 }),
    });
    expect(result.visibilityStatus).toBe("recommended");
    expect(result.filterSignals.weakSignalCount).toBe(1);
  });

  it("captures raw signal values in filterSignals for a future advertiser-parity audit (REV-06)", () => {
    const signals = baseSignals({ accountAgeHours: 2, reviewsLastHour: 4, maxTextSimilarity: 0.4 });
    const result = classifyReview({ text: "Solid experience overall.", signals });
    expect(result.filterSignals.accountAgeHours).toBe(2);
    expect(result.filterSignals.reviewsLastHour).toBe(4);
    expect(result.filterSignals.maxTextSimilarity).toBe(0.4);
    expect(result.filterSignals.priorReviewCount).toBe(5);
  });
});
