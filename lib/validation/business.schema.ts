import { z } from "zod";

// LOC-02: the address model must never accept or expose a ZIP/postal code
// field. `.strict()` rejects any unrecognized key (e.g. `zip`) without
// needing to special-case the word "zip" anywhere in this schema.
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
  })
  .strict();

export type BusinessSeedInput = z.infer<typeof businessSeedSchema>;
