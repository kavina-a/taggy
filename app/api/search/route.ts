import { NextRequest, NextResponse } from "next/server";
import { runSearchQuery, type SearchFilters } from "@/lib/search/run-search-query";
import { parseSearchParams } from "@/lib/search/search-params.schema";

// GET /api/search — identical runSearchQuery call to app/search/page.tsx's
// Server Component; this route performs no ranking logic of its own (T-02-01
// / 02-RESEARCH.md's shared-query anti-pattern warning). Exists for 02-08's
// future client-side live filter updates.
export async function GET(req: NextRequest) {
  const parsed = parseSearchParams(Object.fromEntries(req.nextUrl.searchParams));

  const filters: SearchFilters = {
    textQuery: parsed.find_desc,
    originLat: parsed.lat,
    originLng: parsed.lng,
    sort: parsed.sort,
    page: parsed.page,
  };

  const result = await runSearchQuery(filters);
  return NextResponse.json(result);
}
