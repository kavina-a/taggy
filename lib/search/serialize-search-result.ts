import type { SearchResult } from "./run-search-query";
import type { SearchResultBusinessJson, SearchResultJson } from "./business-card-props";
import { computeOpenNowByBusinessId } from "./business-open-now";

// Single shared conversion from runSearchQuery's Prisma-shaped SearchResult
// to the JSON-safe shape both app/search/page.tsx (initial SSR render) and
// app/api/search/route.ts (client live-filter fetch) send to the browser —
// including the batched openNow annotation (Pitfall 5: one findMany for the
// whole candidate set, never per-business) so the open/closed badge stays
// correct on every live-refreshed result set, not just the first page load.
export async function serializeSearchResult(result: SearchResult): Promise<SearchResultJson> {
  const openNowById = await computeOpenNowByBusinessId(result.businesses.map((b) => b.id));

  const businesses: SearchResultBusinessJson[] = result.businesses.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    primaryCategories: b.primaryCategories,
    district: b.district,
    latitude: b.latitude,
    longitude: b.longitude,
    photos: b.photos.map((p) => ({ url: p.url })),
    attributes: (b.attributes ?? {}) as Record<string, unknown>,
    description: b.description,
    distanceKm: b.distanceKm,
    openNow: openNowById.get(b.id),
  }));

  return {
    businesses,
    totalCount: result.totalCount,
    page: result.page,
    totalPages: result.totalPages,
  };
}
