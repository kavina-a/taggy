import { SearchBar } from "@/components/search/search-bar";
import { BusinessCard } from "@/components/directory/business-card";
import { runSearchQuery, type SearchFilters } from "@/lib/search/run-search-query";
import { parseSearchParams } from "@/lib/search/search-params.schema";
import { getCategoryLabel } from "@/lib/categories/category-config";
import { computeOpenNow } from "@/lib/hours/compute-open-now";
import { prisma } from "@/lib/prisma";
import type { BusinessHoursRow, BusinessHoursOverrideRow } from "@/lib/types/business";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function extractPriceTier(attributes: Record<string, unknown>): 1 | 2 | 3 | 4 | undefined {
  const raw = attributes.priceTier;
  return typeof raw === "number" && raw >= 1 && raw <= 4 ? (raw as 1 | 2 | 3 | 4) : undefined;
}

// runSearchQuery only computes openNow when the openNow *filter* itself was
// requested (02-RESEARCH.md Pattern 5) — this page always wants to *display*
// the badge, so it fetches hours/overrides for the current result page in
// exactly one batched findMany (never one query per business, per Pitfall 5)
// and reuses computeOpenNow verbatim, matching app/business/[slug]/page.tsx.
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const parsed = parseSearchParams(resolvedSearchParams);

  // 02-08 wires categories/priceTiers/attributeFilters/openNow/radiusKm —
  // this plan's thinnest viable slice only handles free-text + geo + sort.
  const filters: SearchFilters = {
    textQuery: parsed.find_desc,
    originLat: parsed.lat,
    originLng: parsed.lng,
    sort: parsed.sort,
    page: parsed.page,
  };

  const result = await runSearchQuery(filters);
  const openNowById = await computeOpenNowByBusinessId(result.businesses.map((b) => b.id));

  const hasLocation = parsed.lat != null && parsed.lng != null;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:py-12">
      <SearchBar initialFindDesc={parsed.find_desc} initialFindLoc={parsed.find_loc} />

      <p className="text-base leading-normal text-muted-foreground">
        {result.totalCount} results{hasLocation ? " near you" : ""}
      </p>

      {result.businesses.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary p-6">
          <h2 className="text-xl leading-[1.2] font-semibold">No matches found</h2>
          <p className="text-base leading-normal text-muted-foreground">
            Try adjusting your filters or searching a wider area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {result.businesses.map((business) => {
            const primarySlug = business.primaryCategories[0] ?? "";
            const categoryLabel = getCategoryLabel(primarySlug) ?? primarySlug;
            const attributes = (business.attributes ?? {}) as Record<string, unknown>;

            return (
              <BusinessCard
                key={business.slug}
                slug={business.slug}
                name={business.name}
                primaryCategory={primarySlug}
                categoryLabel={categoryLabel}
                district={business.district}
                photoUrl={business.photos[0]?.url ?? null}
                priceTier={extractPriceTier(attributes)}
                distanceKm={business.distanceKm}
                snippet={business.description}
                openNow={openNowById.get(business.id)}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
