import { Prisma, type Business, type BusinessPhoto } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { computeOpenNow } from "@/lib/hours/compute-open-now";
import type { BusinessHoursRow, BusinessHoursOverrideRow } from "@/lib/types/business";

// The single shared search-ranking engine (02-RESEARCH.md Pattern 2): text
// relevance (tsvector) + geo-decay + an honestly-neutral rating term (D-02),
// filter composition, all 4 sort options, and the open-now application-layer
// post-filter (Pattern 5). This is the one place Prisma's query builder
// cannot reach (no tsvector/ST_Distance support) — every dynamic value below
// is bound exclusively via Prisma.sql/Prisma.join tagged-template parameter
// binding (T-02-01), never string concatenation.

export const SEARCH_PAGE_SIZE = 24;

export interface SearchFilters {
  textQuery?: string;
  originLat?: number;
  originLng?: number;
  categories?: string[];
  priceTiers?: number[];
  attributeFilters?: Record<string, string | boolean>;
  openNow?: boolean;
  radiusKm?: number;
  // SRCH-03 rating-threshold filter (Phase 3 — real avgRating data now
  // exists). A business with no recommended reviews yet (avgRating null)
  // never matches any threshold above "any", same as a genuine low score
  // failing the bar — "no data" is not "passes".
  minRating?: number;
  sort: "recommended" | "highest_rated" | "most_reviewed" | "distance";
  page: number;
}

type EnrichedBusiness = Business & {
  photos: BusinessPhoto[];
  distanceKm: number | null;
  score: number;
};

export interface SearchResult {
  businesses: EnrichedBusiness[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Tunable weights — named constants, not scattered magic numbers, so a
// future retune touches only this line, per 02-RESEARCH.md Pattern 2.
const W_TEXT = 0.5;
const W_GEO = 0.35;
const W_RATING = 0.15;

// Same offset/scale shape as lib/search/geo-decay.ts's geoDecayScore,
// expressed directly in SQL (not called from inside the raw query, per this
// plan's action) so a future OpenSearch migration can reuse the same
// origin/scale/offset/decay parameters.
const GEO_OFFSET_KM = 1;
const GEO_SCALE_KM = 5;

// Phase 3: real avgRating/reviewCount columns now exist (REV-01+). A
// business with zero recommended reviews still uses this same neutral
// scalar it always used under D-02 — "no data yet" must never be scored as
// a below-average business, only a genuinely low average should be.
const RATING_SCORE_NEUTRAL = 0.5;

// SRCH-05 explicitly requires a Bayesian/Wilson-score-ADJUSTED rating,
// "never a naive average" — a single 5-star review must not outrank a
// business with 50 reviews averaging 4.8. RATING_PRIOR_WEIGHT "phantom"
// reviews at the neutral score are blended in before normalizing, so the
// adjusted score converges toward the true average only as reviewCount
// grows (classic Bayesian/Laplace shrinkage — the simplest correct
// implementation of this requirement, not a full Wilson-score interval,
// which needs a binary positive/negative signal this 1-5 rating isn't).
const RATING_PRIOR_WEIGHT = 5;

// pg_trgm similarity threshold for the zero-tsvector-match fallback pass.
const TRIGRAM_SIMILARITY_THRESHOLD = 0.3;

interface CandidateRow {
  id: string;
  distanceKm: number | null;
  score: number;
}

function buildOriginPoint(filters: SearchFilters): Prisma.Sql {
  if (filters.originLat != null && filters.originLng != null) {
    return Prisma.sql`ST_SetSRID(ST_MakePoint(${filters.originLng}, ${filters.originLat}), 4326)::geography`;
  }
  return Prisma.sql`NULL::geography`;
}

// Every active filter (category, price tier, category-conditional
// attribute, radius) becomes one Prisma.sql condition, joined with AND by
// the caller (02-RESEARCH.md Pattern 4) — arbitrary filter combinations
// without generating N different query shapes.
function buildFilterConditions(filters: SearchFilters, originPoint: Prisma.Sql): Prisma.Sql[] {
  const conditions: Prisma.Sql[] = [];

  if (filters.categories && filters.categories.length > 0) {
    conditions.push(
      Prisma.sql`("primaryCategories" && ${filters.categories}::text[] OR "secondaryCategories" && ${filters.categories}::text[])`,
    );
  }

  if (filters.priceTiers && filters.priceTiers.length > 0) {
    conditions.push(
      Prisma.sql`("attributes"->>'priceTier')::int = ANY(${filters.priceTiers}::int[])`,
    );
  }

  if (filters.attributeFilters) {
    for (const [key, value] of Object.entries(filters.attributeFilters)) {
      conditions.push(Prisma.sql`("attributes"->>${key}) = ${String(value)}`);
    }
  }

  // SRCH-03 distance-radius filter. Only meaningful with an origin point;
  // silently ignored otherwise (no origin means "radius from where?").
  if (filters.radiusKm != null && filters.originLat != null && filters.originLng != null) {
    conditions.push(Prisma.sql`ST_DWithin("location", ${originPoint}, ${filters.radiusKm * 1000})`);
  }

  // SRCH-03 rating-threshold filter (Phase 3 — real avgRating column now
  // exists). NULL avgRating (no recommended reviews yet) never satisfies
  // `>=` in SQL, so a not-yet-rated business is correctly excluded rather
  // than needing a separate NULL-handling branch here.
  if (filters.minRating != null) {
    conditions.push(Prisma.sql`"avgRating" >= ${filters.minRating}::float`);
  }

  return conditions;
}

async function runRankedCandidateQuery(
  whereConditions: Prisma.Sql[],
  textScoreExpr: Prisma.Sql,
  originPoint: Prisma.Sql,
): Promise<CandidateRow[]> {
  const whereClause = whereConditions.length
    ? Prisma.join(whereConditions, " AND ")
    : Prisma.sql`TRUE`;

  return prisma.$queryRaw<CandidateRow[]>(Prisma.sql`
    SELECT
      "id",
      CASE WHEN ${originPoint} IS NOT NULL
        THEN ST_Distance("location", ${originPoint}) / 1000.0
        ELSE NULL END AS "distanceKm",
      (
        ${W_TEXT} * ${textScoreExpr}
        + ${W_GEO} * CASE WHEN ${originPoint} IS NOT NULL
            THEN POWER(0.5::float, GREATEST(0, (ST_Distance("location", ${originPoint}) / 1000.0) - ${GEO_OFFSET_KM}::float) / ${GEO_SCALE_KM}::float)
            ELSE 0.5::float END
        + ${W_RATING} * CASE WHEN "reviewCount" > 0
            THEN (
              "reviewCount"::float * (COALESCE("avgRating", 0)::float / 5.0)
              + ${RATING_PRIOR_WEIGHT}::float * ${RATING_SCORE_NEUTRAL}::float
            ) / ("reviewCount"::float + ${RATING_PRIOR_WEIGHT}::float)
            ELSE ${RATING_SCORE_NEUTRAL}::float END
      ) AS "score"
    FROM "Business"
    WHERE ${whereClause}
    ORDER BY "score" DESC
  `);
}

// A text query matching zero "searchable" (tsvector) rows re-runs a distinct
// pg_trgm similarity() pass against `name` before concluding "no results" —
// never blended into the primary pass's own ORDER BY (Anti-Patterns to
// Avoid). Every dynamic value (textQuery, categories, priceTiers,
// attribute keys/values) is bound via Prisma.sql/Prisma.join parameter
// binding, so a deliberately adversarial textQuery is treated as inert
// search text, never executed as SQL (T-02-01).
async function fetchCandidateRows(filters: SearchFilters): Promise<CandidateRow[]> {
  const originPoint = buildOriginPoint(filters);
  const baseConditions = buildFilterConditions(filters, originPoint);
  const textQuery = filters.textQuery?.trim();

  if (!textQuery) {
    return runRankedCandidateQuery(baseConditions, Prisma.sql`0::float`, originPoint);
  }

  const primaryConditions = [
    ...baseConditions,
    Prisma.sql`"searchable" @@ plainto_tsquery('english', ${textQuery})`,
  ];
  const primaryRows = await runRankedCandidateQuery(
    primaryConditions,
    Prisma.sql`COALESCE(ts_rank_cd("searchable", plainto_tsquery('english', ${textQuery}), 32), 0)`,
    originPoint,
  );
  if (primaryRows.length > 0) {
    return primaryRows;
  }

  const fallbackConditions = [
    ...baseConditions,
    Prisma.sql`similarity("name", ${textQuery}) > ${TRIGRAM_SIMILARITY_THRESHOLD}::float`,
  ];
  return runRankedCandidateQuery(
    fallbackConditions,
    Prisma.sql`COALESCE(similarity("name", ${textQuery}), 0)`,
    originPoint,
  );
}

function applySort(items: EnrichedBusiness[], filters: SearchFilters): EnrichedBusiness[] {
  if (filters.sort === "distance" && filters.originLat != null && filters.originLng != null) {
    return [...items].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }
  if (filters.sort === "highest_rated") {
    // Businesses with no recommended reviews yet (avgRating null) always
    // sort last — never coerced to 0, which would be indistinguishable
    // from a genuine 0-star average. Ties (including all-null, e.g. two
    // brand-new businesses) fall back to a stable name-ASC secondary key.
    return [...items].sort((a, b) => {
      if (a.avgRating == null && b.avgRating == null) return a.name.localeCompare(b.name);
      if (a.avgRating == null) return 1;
      if (b.avgRating == null) return -1;
      return b.avgRating - a.avgRating || a.name.localeCompare(b.name);
    });
  }
  if (filters.sort === "most_reviewed") {
    return [...items].sort(
      (a, b) => b.reviewCount - a.reviewCount || a.name.localeCompare(b.name),
    );
  }
  // "recommended", or "distance" requested without an origin point (falls
  // back to recommended ordering per this plan's behavior contract).
  return [...items].sort((a, b) => b.score - a.score);
}

// Pattern 5 / Pitfall 5: hours/overrides for the whole candidate set are
// fetched in exactly one batched findMany, never one query per business.
// computeOpenNow (Phase 1) is reused verbatim, never re-derived in SQL.
async function filterOpenNow(items: EnrichedBusiness[]): Promise<EnrichedBusiness[]> {
  if (items.length === 0) return items;

  const ids = items.map((b) => b.id);
  const hoursRows = await prisma.business.findMany({
    where: { id: { in: ids } },
    include: { hours: true, hoursOverrides: true },
  });
  const hoursById = new Map(hoursRows.map((b) => [b.id, b]));

  return items.filter((item) => {
    const row = hoursById.get(item.id);
    if (!row) return false;

    const hours: BusinessHoursRow[] = row.hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      crossesMidnight: h.crossesMidnight,
    }));
    const overrides: BusinessHoursOverrideRow[] = row.hoursOverrides.map((o) => ({
      date: o.date.toISOString().slice(0, 10),
      isClosed: o.isClosed,
      openTime: o.openTime,
      closeTime: o.closeTime,
      crossesMidnight: o.crossesMidnight,
    }));

    return computeOpenNow(hours, overrides);
  });
}

export async function runSearchQuery(filters: SearchFilters): Promise<SearchResult> {
  const candidateRows = await fetchCandidateRows(filters);
  const candidateIds = candidateRows.map((r) => r.id);

  if (candidateIds.length === 0) {
    return { businesses: [], totalCount: 0, page: filters.page, totalPages: 0 };
  }

  const scoreById = new Map(candidateRows.map((r) => [r.id, r.score]));
  const distanceById = new Map(candidateRows.map((r) => [r.id, r.distanceKm]));

  // Batch-fetch full Business rows (with a lead photo) for exactly the
  // candidate IDs the raw query returned — one findMany, not N.
  const rawBusinesses = await prisma.business.findMany({
    where: { id: { in: candidateIds } },
    include: { photos: { take: 1 } },
  });

  let enriched: EnrichedBusiness[] = rawBusinesses.map((b) => ({
    ...b,
    distanceKm: distanceById.get(b.id) ?? null,
    score: scoreById.get(b.id) ?? 0,
  }));

  if (filters.openNow === true) {
    // Open-now filtering happens on the full candidate set, before sort and
    // pagination, so totalCount/totalPages stay honest for the filtered
    // result rather than reflecting the pre-filter SQL candidate count.
    enriched = await filterOpenNow(enriched);
  }

  const sorted = applySort(enriched, filters);
  const totalCount = sorted.length;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / SEARCH_PAGE_SIZE);
  const startIndex = (filters.page - 1) * SEARCH_PAGE_SIZE;
  const pageItems = sorted.slice(startIndex, startIndex + SEARCH_PAGE_SIZE);

  return { businesses: pageItems, totalCount, page: filters.page, totalPages };
}
