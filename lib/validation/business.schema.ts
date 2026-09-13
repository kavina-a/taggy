import { z } from "zod";
import { hoursOverrideRowSchema, hoursRowSchema } from "@/lib/hours/hours.schema";

// LOC-02: the address model must never accept or expose a ZIP/postal code
// field. `.strict()` rejects any unrecognized key (e.g. `zip`) without
// needing to special-case the word "zip" anywhere in this schema.
//
// T-02-01: hours/hoursOverrides rows are validated via hoursRowSchema/
// hoursOverrideRowSchema (regex-validated "HH:mm", bounded dayOfWeek)
// before the seed script ever upserts them.
export const businessSeedSchema = z
  .object({
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    primaryCategories: z.array(z.string()).min(1).max(3),
    secondaryCategories: z.array(z.string()).default([]),
    district: z.string().min(1),
    addressFreeText: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    attributes: z.record(z.string(), z.unknown()).default({}),
    hours: z.array(hoursRowSchema).default([]),
    hoursOverrides: z.array(hoursOverrideRowSchema).default([]),
  })
  .strict();

export type BusinessSeedInput = z.infer<typeof businessSeedSchema>;
