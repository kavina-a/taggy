import type { SearchParams } from "./search-params.schema";
import type { SearchFilters } from "./run-search-query";
import { parseAttrsParam } from "./attrs-param";

// Single shared conversion from parseSearchParams's already-validated
// output to runSearchQuery's SearchFilters shape — used by both
// app/search/page.tsx (SSR) and app/api/search/route.ts (client live-filter
// fetch) so the two routes can never drift on how a URL param is turned
// into a query filter (02-RESEARCH.md's "no duplicated ranking logic"
// convention, extended to filter-param parsing).
//
// `rating` is intentionally read but never forwarded into SearchFilters —
// 02-RESEARCH.md Pitfall 1 / CONTEXT.md D-02: no real rating data exists
// until Phase 3, so every threshold above "any" would silently return zero
// results if wired to a nonexistent avgRating column. The UI (FilterFields)
// already renders those chips as disabled rather than functional.
export function buildSearchFiltersFromParams(parsed: SearchParams): SearchFilters {
  const categories = parsed.category
    ? parsed.category.split(",").filter(Boolean)
    : undefined;

  const priceTiers = parsed.price
    ? parsed.price
        .split(",")
        .map(Number)
        .filter((n) => n >= 1 && n <= 4)
    : undefined;

  return {
    textQuery: parsed.find_desc,
    originLat: parsed.lat,
    originLng: parsed.lng,
    categories: categories && categories.length > 0 ? categories : undefined,
    priceTiers: priceTiers && priceTiers.length > 0 ? priceTiers : undefined,
    attributeFilters: parseAttrsParam(parsed.attrs),
    openNow: parsed.openNow === "true" ? true : undefined,
    radiusKm: parsed.radiusKm,
    sort: parsed.sort,
    page: parsed.page,
  };
}
