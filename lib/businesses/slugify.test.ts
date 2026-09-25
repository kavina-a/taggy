import { describe, expect, it } from "vitest";
import { seedPhoneForSlug } from "./seed-phone";
import { slugifyBusinessName } from "./slugify";

describe("seedPhoneForSlug", () => {
  it("returns a stable +9477 E.164 number for the same slug", () => {
    const a = seedPhoneForSlug("ministry-of-crab");
    const b = seedPhoneForSlug("ministry-of-crab");
    expect(a).toBe(b);
    expect(a).toMatch(/^\+9477\d{7}$/);
  });

  it("produces different numbers for different slugs", () => {
    expect(seedPhoneForSlug("ministry-of-crab")).not.toBe(seedPhoneForSlug("upalis"));
  });
});

describe("slugifyBusinessName", () => {
  it("lowercases and hyphenates a normal name", () => {
    expect(slugifyBusinessName("Ministry of Crab")).toBe("ministry-of-crab");
  });

  it("falls back to 'business' for punctuation-only input", () => {
    expect(slugifyBusinessName("!!!")).toBe("business");
  });
});
