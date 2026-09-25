import type { VoteKind } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function loadViewerVotesByReviewId(
  userId: string | null,
  reviewIds: string[],
): Promise<Map<string, VoteKind[]>> {
  const map = new Map<string, VoteKind[]>();
  if (!userId || reviewIds.length === 0) return map;

  const rows = await prisma.reviewVote.findMany({
    where: { userId, reviewId: { in: reviewIds } },
    select: { reviewId: true, kind: true },
  });
  for (const row of rows) {
    const existing = map.get(row.reviewId) ?? [];
    existing.push(row.kind);
    map.set(row.reviewId, existing);
  }
  return map;
}
