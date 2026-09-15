import type { Prisma } from "@/lib/generated/prisma/client";

// REV-04: Business.avgRating/reviewCount are recomputed from `recommended`-
// status reviews ONLY, every time a review is created or edited (its
// visibilityStatus may have changed) — a not_recommended review must never
// move the public rating, but it is never deleted either (it just doesn't
// count here). Always called inside the SAME transaction as the review
// write so the aggregate never observes a partial state.
export async function recomputeBusinessRating(
  tx: Prisma.TransactionClient,
  businessId: string,
): Promise<void> {
  const aggregate = await tx.review.aggregate({
    where: { businessId, visibilityStatus: "recommended" },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const reviewCount = aggregate._count._all;

  await tx.business.update({
    where: { id: businessId },
    data: {
      // null (not 0) when there are zero recommended reviews yet, so
      // callers can distinguish "no data" from "a genuine low score".
      avgRating: reviewCount > 0 ? aggregate._avg.rating : null,
      reviewCount,
    },
  });
}
