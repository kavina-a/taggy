import { createHash } from "node:crypto";
import { SearchBar } from "@/components/search/search-bar";
import { DiscoveryRail, type DiscoveryRailBusiness } from "@/components/home/discovery-rail";
import { CategoryShortcuts } from "@/components/home/category-shortcuts";
import { getCategoryLabel } from "@/lib/categories/category-config";
import { computeOpenNow } from "@/lib/hours/compute-open-now";
import { prisma } from "@/lib/prisma";
import type { BusinessHoursRow, BusinessHoursOverrideRow } from "@/lib/types/business";

// CONTEXT.md D-09: exactly 3 discovery rails ship this phase — Trending Near
// You, New Businesses, Browse by Category — never a fourth rating-driven
// rail: no real avgRating/review data exists anywhere in the data model
// until Phase 3, and D-02 already ruled out fabricating rating data to make
// a rail "feel complete". Revisit once Phase 3 ships real ratings.
const TRENDING_RAIL_SIZE = 10;
const NEW_BUSINESSES_RAIL_SIZE = 10;

// Stable-random sample (02-RESEARCH.md Pattern 5 / CONTEXT.md's Claude's
// Discretion note): no view/click telemetry exists yet, so "trending" is an
// honest, deterministic sample — the same 10 businesses on every request/
// dev-restart, never Math.random() — rather than a fabricated trending
// signal. Revisit once real usage telemetry exists.
function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function extractPriceTier(attributes: Record<string, unknown>): 1 | 2 | 3 | 4 | undefined {
  const raw = attributes.priceTier;
  return typeof raw === "number" && raw >= 1 && raw <= 4 ? (raw as 1 | 2 | 3 | 4) : undefined;
}

interface BusinessRailRow {
  id: string;
  slug: string;
  name: string;
  primaryCategories: string[];
  district: string;
  attributes: unknown;
  photos: { url: string }[];
}

function toRailBusiness(
  business: BusinessRailRow,
  openNow: boolean | undefined,
): DiscoveryRailBusiness {
  const primarySlug = business.primaryCategories[0] ?? "";
  const categoryLabel = getCategoryLabel(primarySlug) ?? primarySlug;
  const attributes = (business.attributes ?? {}) as Record<string, unknown>;

  return {
    slug: business.slug,
    name: business.name,
    primaryCategory: primarySlug,
    categoryLabel,
    district: business.district,
    photoUrl: business.photos[0]?.url ?? null,
    priceTier: extractPriceTier(attributes),
    openNow,
  };
}

// Batched, single findMany — never one query per business (02-RESEARCH.md
// Pitfall 5 / Pattern 5), reusing Phase 1's computeOpenNow verbatim.
async function computeOpenNowByBusinessId(ids: string[]): Promise<Map<string, boolean>> {
  if (ids.length === 0) return new Map();

  const rows = await prisma.business.findMany({
    where: { id: { in: ids } },
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

async function getTrendingIds(): Promise<string[]> {
  const all = await prisma.business.findMany({ select: { id: true } });
  const scored = all
    .map((b) => ({ id: b.id, hash: stableHash(`${b.id}trending-v1`) }))
    .sort((a, b) => (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0));
  return scored.slice(0, TRENDING_RAIL_SIZE).map((s) => s.id);
}

export default async function Home() {
  const trendingIds = await getTrendingIds();

  const [trendingRows, newRows] = await Promise.all([
    prisma.business.findMany({
      where: { id: { in: trendingIds } },
      include: { photos: { take: 1 } },
    }),
    prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      take: NEW_BUSINESSES_RAIL_SIZE,
      include: { photos: { take: 1 } },
    }),
  ]);

  // findMany({ where: { id: { in: [...] } } }) does not preserve input
  // order — re-sort to the stable-hash order computed above.
  const trendingOrder = new Map(trendingIds.map((id, index) => [id, index]));
  trendingRows.sort(
    (a, b) => (trendingOrder.get(a.id) ?? 0) - (trendingOrder.get(b.id) ?? 0),
  );

  const openNowById = await computeOpenNowByBusinessId([
    ...trendingRows.map((b) => b.id),
    ...newRows.map((b) => b.id),
  ]);

  const trending = trendingRows.map((b) => toRailBusiness(b, openNowById.get(b.id)));
  const newBusinesses = newRows.map((b) => toRailBusiness(b, openNowById.get(b.id)));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8 md:gap-16 md:py-12">
      <section className="flex flex-col items-center gap-6 py-8 text-center md:py-12">
        <h1 className="max-w-2xl text-[28px] leading-[1.2] font-semibold">
          Find great local businesses in Colombo
        </h1>
        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>
      </section>

      <DiscoveryRail heading="Trending Near You" businesses={trending} />
      <DiscoveryRail heading="New Businesses" businesses={newBusinesses} />
      <CategoryShortcuts />
    </main>
  );
}
