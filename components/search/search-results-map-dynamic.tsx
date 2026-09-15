"use client";

import dynamic from "next/dynamic";
import type { SearchResultsMapProps } from "./search-results-map";

// Leaflet touches `window`/`document` at render time, so it must never be
// server-rendered — same ssr:false dynamic-import boundary pattern as
// components/business/business-map-dynamic.tsx, applied here for the
// multi-pin search-results variant.
const LazySearchResultsMap = dynamic(
  () => import("./search-results-map").then((mod) => mod.SearchResultsMap),
  {
    ssr: false,
    loading: () => (
      <div
        data-testid="search-results-map"
        className="h-full w-full animate-pulse rounded-md bg-secondary"
      />
    ),
  },
);

export function SearchResultsMapDynamic(props: SearchResultsMapProps) {
  return <LazySearchResultsMap {...props} />;
}

export default SearchResultsMapDynamic;
