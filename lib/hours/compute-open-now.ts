import { DateTime } from "luxon";
import type {
  BusinessHoursRow,
  BusinessHoursOverrideRow,
} from "@/lib/types/business";

// Hardcoded per 01-RESEARCH.md — never read from server env/OS timezone.
const ZONE = "Asia/Colombo";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Checks whether `now` falls inside a shift that started on `shiftDate`.
function isWithinShift(
  now: DateTime,
  shiftDate: DateTime,
  openTime: string,
  closeTime: string,
  crossesMidnight: boolean,
): boolean {
  const startOfShift = shiftDate
    .startOf("day")
    .plus({ minutes: toMinutes(openTime) });
  const rawEndMinutes = toMinutes(closeTime) + (crossesMidnight ? 24 * 60 : 0);
  const endOfShift = shiftDate.startOf("day").plus({ minutes: rawEndMinutes });
  return now >= startOfShift && now < endOfShift;
}

/**
 * Computes whether a business is open at `nowInput` (defaults to the real
 * current time in Asia/Colombo). Checks BOTH yesterday's and today's
 * shifts/overrides, since an overnight shift that started yesterday can
 * still be "open" after midnight today (01-RESEARCH.md Pitfall 1).
 */
export function computeOpenNow(
  hours: BusinessHoursRow[],
  overrides: BusinessHoursOverrideRow[],
  nowInput?: DateTime,
): boolean {
  const now = (nowInput ?? DateTime.now()).setZone(ZONE);
  const today = now.startOf("day");
  const yesterday = today.minus({ days: 1 });

  for (const shiftDate of [yesterday, today]) {
    const iso = shiftDate.toISODate()!;
    const override = overrides.find((o) => o.date === iso);

    if (override) {
      // An override present for this date always wins — never fall through
      // to the regular weekly hours below for this date.
      if (override.isClosed) continue;
      if (override.openTime && override.closeTime) {
        if (
          isWithinShift(
            now,
            shiftDate,
            override.openTime,
            override.closeTime,
            override.crossesMidnight,
          )
        ) {
          return true;
        }
      }
      continue;
    }

    const dayHours = hours.filter(
      (h) => h.dayOfWeek === shiftDate.weekday % 7,
    );
    for (const h of dayHours) {
      if (
        isWithinShift(now, shiftDate, h.openTime, h.closeTime, h.crossesMidnight)
      ) {
        return true;
      }
    }
  }

  return false;
}
