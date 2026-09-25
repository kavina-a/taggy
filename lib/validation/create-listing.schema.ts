import { z } from "zod";
import { isLeafCategorySlug } from "@/lib/categories/category-config";

const leafSlug = z.string().min(1).refine(isLeafCategorySlug, {
  message: "Unknown category",
});

// CLAIM-01 create-new-listing body. Hours/photos are optional (empty listing
// is valid; the owner can add them later). Phone is required so the OTP
// verify can bind the claim. `code` is the claim-purpose OTP sent to `phone`.
export const createListingSchema = z
  .object({
    name: z.string().min(1).max(120),
    description: z.string().min(1).max(5000),
    primaryCategories: z.array(leafSlug).min(1).max(3),
    secondaryCategories: z.array(leafSlug).max(20),
    district: z.string().min(1).max(80),
    addressFreeText: z.string().min(1).max(300),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    phone: z.string().min(1),
    code: z.string().length(6),
  })
  .strict();

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const sendClaimOtpSchema = z
  .object({
    phone: z.string().min(1),
  })
  .strict();
