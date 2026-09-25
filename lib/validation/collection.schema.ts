import { z } from "zod";

export const DEFAULT_COLLECTION_NAME = "My Saved Places";

export const createCollectionSchema = z
  .object({
    name: z.string().min(1).max(80),
  })
  .strict();

export const updateCollectionSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    isPublic: z.boolean().optional(),
  })
  .strict()
  .refine((value) => value.name !== undefined || value.isPublic !== undefined, {
    message: "Nothing to update",
  });

export const addCollectionItemSchema = z
  .object({
    businessId: z.string().min(1),
  })
  .strict();

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AddCollectionItemInput = z.infer<typeof addCollectionItemSchema>;
