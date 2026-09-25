import { prisma } from "@/lib/prisma";
import { computeOpenNow } from "@/lib/hours/compute-open-now";
import type { BusinessHoursRow, BusinessHoursOverrideRow } from "@/lib/types/business";

// runSearchQuery only computes openNow when the openNow *filter* itself was
// requested (02-RESEARCH.md Pattern 5) — display of the open/closed badge
// needs its own single batched fetch for whatever candidate set is being
// rendered (SSR page load or a live /api/search re-fetch), never one query
// per business (Pitfall 5). Shared by app/search/page.tsx and
// app/api/search/route.ts via lib/search/serialize-search-result.ts so both
// code paths compute this identically.
export async function computeOpenNowByBusinessId(ids: string[]): Promise<Map<string, boolean>> {
  if (ids.length === 0) return new Map();

  const rows = await prisma.business.findMany({
    where: { id: { in: ids }, isTest: false },
    select: { id: true, hours: true, hoursOverrides: true },
  });

  const result = new Map<string, boolean>();
  for (const row of rows) {
    const hours: BusinessHoursRow[] = row.hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      crossesMidnight: h.crossesMidnight,
    }));
    const overrides: BusinessHoursOverrideRow[] = row.hoursOverrides.map((o) => ({
      date: o.date.toISOString().slice(0, 10),
      isClosed: o.isClosed,
      openTime: o.openTime,
      closeTime: o.closeTime,
      crossesMidnight: o.crossesMidnight,
    }));
    result.set(row.id, computeOpenNow(hours, overrides));
  }
  return result;
}
