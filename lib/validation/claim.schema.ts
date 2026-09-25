import { z } from "zod";

export const verifyClaimSchema = z
  .object({
    code: z.string().length(6),
  })
  .strict();

export type VerifyClaimInput = z.infer<typeof verifyClaimSchema>;
