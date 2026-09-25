import { describe, expect, it } from "vitest";
import { isModeratorPhone, parseModeratorPhones } from "./is-moderator";

describe("isModeratorPhone", () => {
  it("treats an empty env as nobody", () => {
    expect(parseModeratorPhones("")).toEqual([]);
    expect(isModeratorPhone("+94771234567", "")).toBe(false);
    expect(isModeratorPhone("+94771234567", undefined)).toBe(false);
  });

  it("matches a listed E.164 phone and ignores surrounding whitespace", () => {
    const raw = " +94770000001, +94770000002 ";
    expect(isModeratorPhone("+94770000001", raw)).toBe(true);
    expect(isModeratorPhone("+94770000099", raw)).toBe(false);
  });
});
