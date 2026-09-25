import { z } from "zod";

export const reportTargetTypeSchema = z.enum(["review", "photo", "business"]);
export const reportReasonSchema = z.enum([
  "spam",
  "offensive",
  "misleading",
  "not_relevant",
  "other",
]);

export const createReportSchema = z
  .object({
    targetType: reportTargetTypeSchema,
    targetId: z.string().min(1),
    reason: reportReasonSchema,
  })
  .strict();

export type CreateReportInput = z.infer<typeof createReportSchema>;
