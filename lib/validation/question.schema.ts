import { z } from "zod";

export const createQuestionSchema = z
  .object({
    text: z.string().min(10).max(500),
  })
  .strict();

export const createAnswerSchema = z
  .object({
    text: z.string().min(10).max(2000),
  })
  .strict();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
