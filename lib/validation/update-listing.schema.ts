import { z } from "zod";
import { hoursRowSchema } from "@/lib/hours/hours.schema";

export const updateListingSchema = z
  .object({
    description: z.string().min(1).max(5000).optional(),
    addressFreeText: z.string().min(1).max(300).optional(),
    hours: z.array(hoursRowSchema).max(21).optional(),
  })
  .strict();

export type UpdateListingInput = z.infer<typeof updateListingSchema>;
