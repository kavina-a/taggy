import { describe, expect, it } from "vitest";
import { classifyContent } from "./classify-content";

// MOD-01: real-time profanity/hate-speech/PII classifier. This is the HARD
// BLOCK gate (distinct from lib/reviews/review-filter.ts's soft
// recommended/not_recommended visibility filter) — a match here means the
// submission is rejected outright and the author IS told why (unlike the
// review filter's outcome, which must never be disclosed).
describe("classifyContent", () => {
  it("passes clean review text with no reasons", () => {
    const result = classifyContent(
      "Great food and friendly staff, we will definitely come back for the kottu again!",
    );
    expect(result.blocked).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it("blocks text containing a Sri Lankan phone number (0XXXXXXXXX)", () => {
    const result = classifyContent("Great place, call the owner directly at 0771234567 for bookings.");
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("pii_phone");
  });

  it("blocks text containing a Sri Lankan phone number (+94XXXXXXXXX)", () => {
    const result = classifyContent("Reach them on +94771234567 instead of the listed line.");
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("pii_phone");
  });

  it("blocks text containing an email address", () => {
    const result = classifyContent("Message the manager at owner@example.com for a discount.");
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("pii_email");
  });

  it("blocks text containing a credit-card-like digit sequence", () => {
    const result = classifyContent("They asked me to pay via card 4111 1111 1111 1111 over the phone.");
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("pii_card");
  });

  it("blocks text containing a profane word", () => {
    const result = classifyContent("This place is fucking terrible and the staff were rude.");
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain("profanity");
  });

  it("does not flag words that merely contain a profane substring (word-boundary false-positive guard)", () => {
    // "classy" contains "ass" and "passionate" contains "pass" — neither
    // should match a word-boundary-anchored blocklist term.
    const result = classifyContent(
      "The staff were classy and passionate about service, a genuinely assuring experience.",
    );
    expect(result.blocked).toBe(false);
    expect(result.reasons).toEqual([]);
  });
});
