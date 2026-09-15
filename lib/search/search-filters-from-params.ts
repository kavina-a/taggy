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
    minRating: parsed.rating === "any" ? undefined : Number(parsed.rating),
    sort: parsed.sort,
    page: parsed.page,
  };
}
