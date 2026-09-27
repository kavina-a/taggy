import { SearchBar } from "@/components/search/search-bar";
import { SearchExperience } from "@/components/search/search-experience";
import { runSearchQuery } from "@/lib/search/run-search-query";
import { parseSearchParams } from "@/lib/search/search-params.schema";
import { buildSearchFiltersFromParams } from "@/lib/search/search-filters-from-params";
import { serializeSearchResult } from "@/lib/search/serialize-search-result";
import { parseAttrsParam } from "@/lib/search/attrs-param";
import type { FilterState } from "@/components/search/filter-state";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const parsed = parseSearchParams(resolvedSearchParams);

  const filters = buildSearchFiltersFromParams(parsed);
  const result = await runSearchQuery(filters);
  const initialResult = await serializeSearchResult(result);

  const hasLocation =
    (parsed.lat != null && parsed.lng != null) ||
    (filters.originLat != null && filters.originLng != null);

  const initialFilters: FilterState = {
    categories: filters.categories ?? [],
    priceTiers: filters.priceTiers ?? [],
    openNow: filters.openNow === true,
    radiusKm: filters.radiusKm,
    rating: parsed.rating,
    attrs: parseAttrsParam(parsed.attrs) ?? {},
  };

  const searchKey = new URLSearchParams(
    Object.entries(resolvedSearchParams).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((item) => [k, item]) : v != null ? [[k, v]] : []
    )
  ).toString();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:py-12">
      <SearchBar
        key={`bar-${searchKey}`}
        initialFindDesc={parsed.find_desc}
        initialFindLoc={parsed.find_loc}
      />

      <SearchExperience
        key={`exp-${searchKey}`}
        initialFilters={initialFilters}
        initialSort={parsed.sort}
        initialResult={initialResult}
        hasLocation={hasLocation}
      />
    </main>
  );
}
