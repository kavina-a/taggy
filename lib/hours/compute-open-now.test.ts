import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { computeOpenNow } from "./compute-open-now";
import type {
  BusinessHoursRow,
  BusinessHoursOverrideRow,
} from "@/lib/types/business";

const ZONE = "Asia/Colombo";

// Reference week (verified against a real calendar): 2026-09-14 is a Monday,
// 2026-09-15 is a Tuesday. All tests pass an explicit `now` — never the real
// clock — per RESEARCH.md's Pitfall 1 guidance.
const MONDAY = "2026-09-14"; // dayOfWeek 1
const TUESDAY = "2026-09-15"; // dayOfWeek 2

function at(date: string, time: string): DateTime {
  const [hour, minute] = time.split(":").map(Number);
  return DateTime.fromISO(date, { zone: ZONE }).set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
}

describe("computeOpenNow", () => {
  it("is open during a same-day (no midnight crossing) Tuesday shift", () => {
    const hours: BusinessHoursRow[] = [
      { dayOfWeek: 2, openTime: "09:00", closeTime: "17:00", crossesMidnight: false },
    ];
    expect(computeOpenNow(hours, [], at(TUESDAY, "12:00"))).toBe(true);
  });

  it("is closed after a same-day Tuesday shift's close time", () => {
    const hours: BusinessHoursRow[] = [
      { dayOfWeek: 2, openTime: "09:00", closeTime: "17:00", crossesMidnight: false },
    ];
    expect(computeOpenNow(hours, [], at(TUESDAY, "18:00"))).toBe(false);
  });

  it("is still open just after midnight for a Monday shift that crosses into Tuesday", () => {
    const hours: BusinessHoursRow[] = [
      { dayOfWeek: 1, openTime: "18:00", closeTime: "02:00", crossesMidnight: true },
    ];
    expect(computeOpenNow(hours, [], at(TUESDAY, "00:30"))).toBe(true);
  });

  it("is closed once a midnight-crossing Monday shift's 02:00 close has passed", () => {
    const hours: BusinessHoursRow[] = [
      { dayOfWeek: 1, openTime: "18:00", closeTime: "02:00", crossesMidnight: true },
    ];
    expect(computeOpenNow(hours, [], at(TUESDAY, "03:00"))).toBe(false);
  });

  it("is closed when today has a holiday override with isClosed even though regular hours say open", () => {
    const hours: BusinessHoursRow[] = [
      { dayOfWeek: 2, openTime: "09:00", closeTime: "17:00", crossesMidnight: false },
    ];
    const overrides: BusinessHoursOverrideRow[] = [
      {
        date: TUESDAY,
        isClosed: true,
        openTime: null,
        closeTime: null,
        crossesMidnight: false,
      },
    ];
    expect(computeOpenNow(hours, overrides, at(TUESDAY, "12:00"))).toBe(false);
  });

  it("is open when yesterday's override shift crosses midnight into today, even though today's own regular hours say closed", () => {
    // Today's (Tuesday's) own regular hours: closed at 00:15 (no matching row).
    const hours: BusinessHoursRow[] = [
      { dayOfWeek: 2, openTime: "09:00", closeTime: "17:00", crossesMidnight: false },
    ];
    const overrides: BusinessHoursOverrideRow[] = [
      {
        date: MONDAY,
        isClosed: false,
        openTime: "20:00",
        closeTime: "01:00",
        crossesMidnight: true,
      },
    ];
    expect(computeOpenNow(hours, overrides, at(TUESDAY, "00:15"))).toBe(true);
  });

  it("is closed when there are no hours rows for the current day and no override", () => {
    expect(computeOpenNow([], [], at(TUESDAY, "12:00"))).toBe(false);
  });
});
