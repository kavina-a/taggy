import { z } from "zod";

// SRCH-04: the 4 sort options this phase supports.
export const sortOptionSchema = z.enum([
  "recommended",
  "highest_rated",
  "most_reviewed",
  "distance",
]);

// SRCH-03's rating-threshold filter chips. Per 02-RESEARCH.md Pitfall 1 /
// D-02, this is accepted and validated here but never turned into a WHERE
// clause in lib/search/run-search-query.ts — no real rating data exists
// until Phase 3.
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
