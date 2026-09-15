"use client";

import { useCallback, useState } from "react";
import { MapIcon, XIcon } from "lucide-react";
import { BusinessCard } from "@/components/directory/business-card";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "./filter-sidebar";
import { FilterSheet } from "./filter-sheet";
import { SortDropdown } from "./sort-dropdown";
import { SearchResultsMapDynamic } from "./search-results-map-dynamic";
import { useSearchFilterState } from "./use-search-filter-state";
import { mapBusinessToCardProps, type SearchResultJson } from "@/lib/search/business-card-props";
import { DEFAULT_FILTER_STATE, hasActiveFilters, type FilterState, type SortOption } from "./filter-state";

export interface SearchExperienceProps {
  initialFilters: FilterState;
  initialSort: SortOption;
  initialResult: SearchResultJson;
  hasLocation: boolean;
}

// Orchestrates FilterSidebar/FilterSheet/SortDropdown (Tasks 1-2) plus the
// results grid, sticky desktop map, and mobile map toggle on top of 02-04's
// SSR-loaded initial page — a single client boundary so filters/sort/map
// share one results state instead of racing independent fetches
// (02-08-PLAN.md Task 3).
export function SearchExperience({
  initialFilters,
  initialSort,
  initialResult,
  hasLocation,
}: SearchExperienceProps) {
  const [result, setResult] = useState(initialResult);
  const [errored, setErrored] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const handleResults = useCallback((json: SearchResultJson) => {
    setErrored(false);
    setResult(json);
  }, []);

  const handleError = useCallback(() => setErrored(true), []);

  const { filters, sort, resultCount, applyFilters, setSort, retry } = useSearchFilterState(
    initialFilters,
    initialSort,
    handleResults,
    handleError,
  );

  const filtersActive = hasActiveFilters(filters);

  function clearFilters() {
    applyFilters(DEFAULT_FILTER_STATE);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <div className="flex items-center gap-2">
          <FilterSheet filters={filters} resultCount={resultCount || result.totalCount} onApply={applyFilters} />
          <SortDropdown sort={sort} onSortChange={setSort} />
        </div>
        <Button type="button" variant="outline" className="min-h-11 gap-1.5" onClick={() => setShowMobileMap(true)}>
          <MapIcon className="size-4" />
          Map
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <div className="hidden md:block">
          <FilterSidebar filters={filters} onChange={applyFilters} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="hidden items-center justify-between md:flex">
            <p className="text-base leading-normal text-muted-foreground">
              {result.totalCount} results{hasLocation ? " near you" : ""}
            </p>
            <SortDropdown sort={sort} onSortChange={setSort} />
          </div>
          <p className="text-base leading-normal text-muted-foreground md:hidden">
            {result.totalCount} results{hasLocation ? " near you" : ""}
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_minmax(0,42%)]">
            <div>
              {errored ? (
                <div className="flex flex-col items-start gap-3 rounded-lg bg-secondary p-6">
                  <h2 className="text-xl leading-[1.2] font-semibold">Something went wrong</h2>
                  <p className="text-base leading-normal text-muted-foreground">
                    We couldn&apos;t load results right now. Please try again.
                  </p>
                  <Button type="button" variant="outline" onClick={retry}>
                    Retry
                  </Button>
                </div>
              ) : result.businesses.length === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-lg bg-secondary p-6">
                  <h2 className="text-xl leading-[1.2] font-semibold">No matches found</h2>
                  <p className="text-base leading-normal text-muted-foreground">
                    Try adjusting your filters or searching a wider area.
                  </p>
                  {filtersActive && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="min-h-11 text-base font-medium text-brand-accent underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {result.businesses.map((business) => (
                    <BusinessCard key={business.slug} {...mapBusinessToCardProps(business)} />
                  ))}
                </div>
              )}
            </div>

            <div className="sticky top-4 hidden h-[70vh] md:block">
              <SearchResultsMapDynamic businesses={result.businesses} />
            </div>
          </div>
        </div>
      </div>

      {showMobileMap && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
          <div className="flex items-center justify-between border-b p-4">
            <p className="text-base font-medium">Map</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMap(false)}
              aria-label="Close map"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          <div className="flex-1">
            <SearchResultsMapDynamic businesses={result.businesses} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchExperience;
