import { z } from "zod";

// Zod .strict() convention (lib/validation/business.schema.ts,
// lib/hours/hours.schema.ts) — rejects any unrecognized key.
export const sendOtpSchema = z
  .object({
    phone: z.string().min(1),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    phone: z.string().min(1),
    code: z.string().length(6),
  })
  .strict();
