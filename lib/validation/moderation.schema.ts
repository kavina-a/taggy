import { z } from "zod";

export const updateReportStatusSchema = z
  .object({
    status: z.enum(["pending", "reviewed", "actioned", "dismissed"]),
    consumerAlert: z.string().max(500).nullable().optional(),
  })
  .strict();

export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
