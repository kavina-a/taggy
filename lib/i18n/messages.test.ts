import { describe, expect, it } from "vitest";
import { getDictionary, getMessage, si, ta } from "./messages";

describe("i18n dictionaries", () => {
  it("returns Sinhala and Tamil chrome strings that differ from English", () => {
    expect(getDictionary("si").home.headline).toBe(si.home.headline);
    expect(getDictionary("ta").home.topRated).toBe(ta.home.topRated);
    expect(si.home.headline).not.toBe(getDictionary("en").home.headline);
    expect(ta.header.login).not.toBe(getDictionary("en").header.login);
  });

  it("looks up nested keys and falls back to the path when missing", () => {
    expect(getMessage(getDictionary("en"), "home.topRated")).toBe("Top Rated this month");
    expect(getMessage(getDictionary("en"), "home.doesNotExist")).toBe("home.doesNotExist");
  });
});
