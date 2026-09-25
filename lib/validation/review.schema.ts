import { z } from "zod";
import { photoUrlSchema } from "@/lib/validation/photo-upload.schema";

export const createReviewSchema = z
  .object({
    businessId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(50).max(5000),
    visitDate: z.string().datetime().optional(),
    photos: z.array(photoUrlSchema).max(10).optional(),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    text: z.string().min(50).max(5000),
    visitDate: z.string().datetime().optional(),
    photos: z.array(photoUrlSchema).max(10).optional(),
  })
  .strict();

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
