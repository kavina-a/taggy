import { NextRequest, NextResponse } from "next/server";
import { runSearchQuery } from "@/lib/search/run-search-query";
import { parseSearchParams } from "@/lib/search/search-params.schema";
import { buildSearchFiltersFromParams } from "@/lib/search/search-filters-from-params";
import { serializeSearchResult } from "@/lib/search/serialize-search-result";

// GET /api/search — identical runSearchQuery call to app/search/page.tsx's
// Server Component, via the same buildSearchFiltersFromParams/
// serializeSearchResult shared helpers (T-02-01 / 02-RESEARCH.md's
// shared-query anti-pattern warning: no duplicated ranking or filter-param
// parsing logic between the two routes). Powers 02-08's client-side live
// filter/sort updates (components/search/use-search-filter-state.ts).
export async function GET(req: NextRequest) {
  const parsed = parseSearchParams(Object.fromEntries(req.nextUrl.searchParams));
  const filters = buildSearchFiltersFromParams(parsed);

  const result = await runSearchQuery(filters);
  const json = await serializeSearchResult(result);

  return NextResponse.json(json);
}
