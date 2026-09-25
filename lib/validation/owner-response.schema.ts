import { z } from "zod";

export const ownerResponseSchema = z
  .object({
    text: z.string().min(1).max(2000),
  })
  .strict();

export type OwnerResponseInput = z.infer<typeof ownerResponseSchema>;
