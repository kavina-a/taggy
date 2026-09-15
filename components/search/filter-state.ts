// Shared filter/sort state shape + pure helpers used by FilterSidebar,
// FilterSheet, SortDropdown, and the client-side URL/fetch sync hook
// (use-search-filter-state.ts). Kept dependency-free (no "use client") so it
// can be imported from both client components and, if ever needed, from a
// Server Component without pulling React/browser globals into the module
// graph unnecessarily.

export type SortOption = "recommended" | "highest_rated" | "most_reviewed" | "distance";

export type RatingThreshold = "any" | "3" | "4" | "4.5";

export interface FilterState {
  categories: string[];
  priceTiers: number[];
  openNow: boolean;
  radiusKm: number | undefined;
  rating: RatingThreshold;
  attrs: Record<string, boolean>;
}

// Discrete stops per 02-UI-SPEC.md's "distance radius (slider, discrete
// stops at 1/3/5/10/25 km)".
export const RADIUS_STOPS: number[] = [1, 3, 5, 10, 25];

// Rating chips above "Any" are locked disabled per 02-RESEARCH.md Pitfall 1
// / D-02 — no real rating data exists until Phase 3.
export const RATING_OPTIONS: RatingThreshold[] = ["any", "3", "4", "4.5"];

export const PRICE_TIERS: number[] = [1, 2, 3, 4];

export const DEFAULT_FILTER_STATE: FilterState = {
  categories: [],
  priceTiers: [],
  openNow: false,
  radiusKm: undefined,
  rating: "any",
  attrs: {},
};

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.categories.length > 0 ||
    filters.priceTiers.length > 0 ||
    filters.openNow ||
    filters.radiusKm != null ||
    filters.rating !== "any" ||
    Object.values(filters.attrs).some(Boolean)
  );
}

// Merges a FilterState + sort into an existing URLSearchParams (preserving
// unrelated keys like find_desc/find_loc/lat/lng), removing keys back to
// their "unset" default rather than writing empty-string params.
export function applyFilterStateToParams(
  params: URLSearchParams,
  filters: FilterState,
  sort: SortOption,
): void {
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  else params.delete("category");

  if (filters.priceTiers.length) params.set("price", filters.priceTiers.join(","));
  else params.delete("price");

  if (filters.openNow) params.set("openNow", "true");
  else params.delete("openNow");

  if (filters.radiusKm != null) params.set("radiusKm", String(filters.radiusKm));
  else params.delete("radiusKm");

  if (filters.rating !== "any") params.set("rating", filters.rating);
  else params.delete("rating");

  const attrsStr = Object.entries(filters.attrs)
    .filter(([, value]) => value)
    .map(([key]) => `${key}:true`)
    .join(",");
  if (attrsStr) params.set("attrs", attrsStr);
  else params.delete("attrs");

  params.set("sort", sort);
  // Any filter/sort change resets pagination to the first page — an active
  // deeper page could otherwise silently show as "no results".
  params.set("page", "1");
}
