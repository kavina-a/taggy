import { z } from "zod";

// REV-01: rating 1-5 required first, then text meeting a minimum length —
// 50 characters, matching REQUIREMENTS.md's own "enforced minimum length"
// wording for this milestone. `.strict()` (project convention,
// lib/validation/business.schema.ts / lib/otp/otp.schema.ts) rejects any
// unrecognized key outright, including a client-supplied `visibilityStatus`
// — that field is server-derived only, never client input (security note).
export const createReviewSchema = z
  .object({
    businessId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(50).max(5000),
    visitDate: z.string().datetime().optional(),
    // No file-upload infra this phase — already-uploaded URLs only.
    photos: z.array(z.string().url()).max(10).optional(),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// REV-02: editing never changes which business the review belongs to — no
// `businessId` field here at all (immutable once created).
export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    text: z.string().min(50).max(5000),
    visitDate: z.string().datetime().optional(),
    photos: z.array(z.string().url()).max(10).optional(),
  })
  .strict();

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
