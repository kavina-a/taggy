import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { updateReviewSchema } from "@/lib/validation/review.schema";
import { classifyContent } from "@/lib/moderation/classify-content";
import { classifyReview } from "@/lib/reviews/review-filter";
import { gatherReviewSignals } from "@/lib/reviews/gather-review-signals";
import { recomputeBusinessRating } from "@/lib/reviews/recompute-business-rating";
import { toAuthorReviewResponse } from "@/lib/reviews/author-review-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// REV-02: a user can edit their OWN review at any time; editing re-runs
// both the MOD-01 hard-block check and the REV-03 visibility filter from
// scratch (a previously-recommended review can become not_recommended on
// edit, and vice versa) — never carries the prior classification forward.
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.review.findUnique({
    where: { id },
    select: { id: true, userId: true, businessId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  // Only the review's author may edit it — never trust a client-supplied
  // identity, only the server-verified session (T-02-12 pattern).
  if (existing.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsedBody = updateReviewSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { rating, text, visitDate, photos } = parsedBody.data;

  const moderation = classifyContent(text);
  if (moderation.blocked) {
    return NextResponse.json(
      { error: "Your review could not be published.", reasons: moderation.reasons },
      { status: 400 },
    );
  }

  const signals = await gatherReviewSignals({
    userId: session.userId,
    text,
    excludeReviewId: id,
  });
  const filterResult = classifyReview({ text, signals });

  const review = await prisma.$transaction(async (tx) => {
    if (photos) {
      // Simplest correct edit semantics for this phase: an edit's `photos`
      // array (if provided) fully replaces the prior set, never merges.
      await tx.reviewPhoto.deleteMany({ where: { reviewId: id } });
    }

    const updated = await tx.review.update({
      where: { id },
      data: {
        rating,
        text,
        visitDate: visitDate ? new Date(visitDate) : null,
        visibilityStatus: filterResult.visibilityStatus,
        filterReason: filterResult.filterReason,
        filterSignals: filterResult.filterSignals as unknown as Prisma.InputJsonValue,
        editedAt: new Date(),
        photos:
          photos && photos.length > 0
            ? { create: photos.map((url) => ({ url })) }
            : undefined,
      },
    });

    // REV-04: re-recomputed since this edit may have changed which bucket
    // the review is in (recommended <-> not_recommended).
    await recomputeBusinessRating(tx, existing.businessId);

    return updated;
  });

  // Same response-shape secrecy rule as POST /api/reviews — never leaks
  // visibilityStatus/filterReason to the author (spec 6.3).
  return NextResponse.json(toAuthorReviewResponse(review));
}
