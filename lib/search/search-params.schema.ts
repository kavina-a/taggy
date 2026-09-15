import { z } from "zod";

// SRCH-04: the 4 sort options this phase supports.
export const sortOptionSchema = z.enum([
  "recommended",
  "highest_rated",
  "most_reviewed",
  "distance",
]);

// SRCH-03's rating-threshold filter chips, wired to a real WHERE clause in
// lib/search/run-search-query.ts (Business.avgRating) since Phase 3 —
// see lib/search/search-filters-from-params.ts for the string->number
// conversion this schema's validated string values feed into.
const ratingThresholdSchema = z.enum(["any", "3", "4", "4.5"]);

// `.strict()` (project convention, lib/validation/business.schema.ts /
// lib/otp/otp.schema.ts) — rejects any unrecognized query key outright
// rather than silently ignoring it.
export const searchParamsSchema = z
  .object({
    find_desc: z.string().max(200).optional(),
    find_loc: z.string().max(200).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    category: z.string().max(500).optional(),
    price: z
      .string()
      .regex(/^[1-4](,[1-4])*$/, "price must be a comma-separated list of 1-4")
      .optional(),
    openNow: z.enum(["true", "false"]).optional(),
    radiusKm: z.coerce.number().positive().optional(),
    rating: ratingThresholdSchema.default("any"),
    // Category-conditional boolean attribute filters (SRCH-03), e.g.
    // "delivery:true,wifi:true" — see lib/search/attrs-param.ts for the
    // parser. A single fixed key since the underlying attribute keys are
    // category-dependent and can't be enumerated in this .strict() schema.
    attrs: z.string().max(500).optional(),
    sort: sortOptionSchema.default("recommended"),
    page: z.coerce.number().int().positive().default(1),
  })
  .strict();

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Next.js `searchParams`-shaped input: repeated query keys parse as
// `string[]`; this function normalizes those to their first value before
// validating (this schema's fields are all single-valued).
export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): SearchParams {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  return searchParamsSchema.parse(normalized);
}
