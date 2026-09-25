import { z } from "zod";

export const voteKindSchema = z.enum(["useful", "funny", "cool"]);

export const toggleVoteSchema = z
  .object({
    kind: voteKindSchema,
  })
  .strict();

export type ToggleVoteInput = z.infer<typeof toggleVoteSchema>;
export type VoteKindInput = z.infer<typeof voteKindSchema>;
