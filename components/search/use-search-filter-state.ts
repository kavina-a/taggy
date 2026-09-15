"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { SearchResultJson } from "@/lib/search/business-card-props";
import { applyFilterStateToParams, type FilterState, type SortOption } from "./filter-state";

// Debounce window for the live-refetch, per 02-UI-SPEC.md's mobile-
// performance note (~300ms).
const FETCH_DEBOUNCE_MS = 300;

export interface UseSearchFilterStateResult {
  filters: FilterState;
  sort: SortOption;
  resultCount: number;
  loading: boolean;
  applyFilters: (patch: Partial<FilterState>) => void;
  setSort: (sort: SortOption) => void;
  retry: () => void;
}

// The single shared URL-sync + debounced-refetch mechanism used once by
// SearchExperience and handed down as props/callbacks to FilterSidebar,
// FilterSheet, and SortDropdown (02-08-PLAN.md Task 1/2's "shared internal
// hook" requirement) — a single instance avoids each control racing its own
// independent fetch against a results list only one of them should own.
//
// URL updates use raw `history.replaceState` (never Next's router.replace)
// so a filter tap never triggers a full Server Component RSC round-trip —
// only the dedicated GET /api/search fetch below refreshes the visible
// results, per 02-UI-SPEC.md's "prefer client-side query-param updates with
// a debounced fetch ... instead of reloading the whole page" guidance. The
// URL is still updated via a *history-replacing* call (never push), so
// rapid filter taps don't pollute the back-button stack (Task 1's behavior
// contract).
export function useSearchFilterState(
  initialFilters: FilterState,
  initialSort: SortOption,
  onResults: (json: SearchResultJson) => void,
  onError: () => void,
): UseSearchFilterStateResult {
  const pathname = usePathname();
  const initialSearchParams = useSearchParams();
  const baseParamsRef = useRef(new URLSearchParams(initialSearchParams.toString()));

  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSortState] = useState(initialSort);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const runFetch = useCallback(
    (nextFilters: FilterState, nextSort: SortOption) => {
      const params = new URLSearchParams(baseParamsRef.current.toString());
      applyFilterStateToParams(params, nextFilters, nextSort);
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);

      setLoading(true);
      const requestId = ++requestIdRef.current;
      fetch(`/api/search?${params.toString()}`)
        .then((res) =>
          res.ok ? (res.json() as Promise<SearchResultJson>) : Promise.reject(new Error("search failed")),
        )
        .then((json) => {
          if (requestId !== requestIdRef.current) return; // stale response, ignore
          setResultCount(json.totalCount);
          onResults(json);
        })
        .catch(() => {
          if (requestId === requestIdRef.current) onError();
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false);
        });
    },
    [pathname, onResults, onError],
  );

  const commit = useCallback(
    (nextFilters: FilterState, nextSort: SortOption) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runFetch(nextFilters, nextSort), FETCH_DEBOUNCE_MS);
    },
    [runFetch],
  );

  const applyFilters = useCallback(
    (patch: Partial<FilterState>) => {
      const next = { ...filters, ...patch };
      setFilters(next);
      commit(next, sort);
    },
    [filters, sort, commit],
  );

  const setSort = useCallback(
    (nextSort: SortOption) => {
      setSortState(nextSort);
      commit(filters, nextSort);
    },
    [filters, commit],
  );

  const retry = useCallback(() => runFetch(filters, sort), [filters, sort, runFetch]);

  return { filters, sort, resultCount, loading, applyFilters, setSort, retry };
}
