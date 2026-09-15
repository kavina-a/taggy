import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createReviewSchema } from "@/lib/validation/review.schema";
import { classifyContent } from "@/lib/moderation/classify-content";
import { classifyReview } from "@/lib/reviews/review-filter";
import { gatherReviewSignals } from "@/lib/reviews/gather-review-signals";
import { recomputeBusinessRating } from "@/lib/reviews/recompute-business-rating";
import { toAuthorReviewResponse } from "@/lib/reviews/author-review-response";

// REV-01/REV-03/MOD-01: write one review per business. `userId` is read
// exclusively from the server-verified session (never a client-supplied
// body field, matching app/api/auth/profile/route.ts's T-02-12 pattern) —
// a caller can only ever author a review as themselves.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = createReviewSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { businessId, rating, text, visitDate, photos } = parsedBody.data;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // MOD-01 hard block — distinct from the REV-03 visibility filter below.
  // This outcome IS shown to the author (it's not the secret filter).
  const moderation = classifyContent(text);
  if (moderation.blocked) {
    return NextResponse.json(
      { error: "Your review could not be published.", reasons: moderation.reasons },
      { status: 400 },
    );
  }

  // REV-03: synchronous classification at publish time. The result is
  // written to the DB but NEVER echoed back to the author below (spec 6.3).
  const signals = await gatherReviewSignals({ userId: session.userId, text });
  const filterResult = classifyReview({ text, signals });

  try {
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          businessId,
          userId: session.userId!,
          rating,
          text,
          visitDate: visitDate ? new Date(visitDate) : undefined,
          visibilityStatus: filterResult.visibilityStatus,
          filterReason: filterResult.filterReason,
          filterSignals: filterResult.filterSignals as unknown as Prisma.InputJsonValue,
          photos:
            photos && photos.length > 0
              ? { create: photos.map((url) => ({ url })) }
              : undefined,
        },
      });

      // REV-04: recomputed from `recommended` reviews only, in the SAME
      // transaction as the write so the aggregate is never briefly stale.
      await recomputeBusinessRating(tx, businessId);

      return created;
    });

    return NextResponse.json(toAuthorReviewResponse(review), { status: 201 });
  } catch (err) {
    // REV-01: DB-level @@unique([userId, businessId]) is the actual
    // enforcement — this catch only turns Postgres's P2002 into a clean,
    // specific error rather than a generic 500.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this business." },
        { status: 409 },
      );
    }
    throw err;
  }
}
