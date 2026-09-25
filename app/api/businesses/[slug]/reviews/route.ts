import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { reviewListInclude, toReviewListItem } from "@/lib/reviews/to-review-list-item";
import { loadViewerVotesByReviewId } from "@/lib/reviews/load-viewer-votes";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Read surface for a business's reviews — defaults to `recommended` reviews
// only; `?includeFiltered=true` also returns `not_recommended` ones (never
// deleted per REV-04). Never includes `filterReason`/`filterSignals`.
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const includeFiltered = req.nextUrl.searchParams.get("includeFiltered") === "true";
  const session = await getSession();
  const currentUserId = session.userId ?? null;

  const reviews = await prisma.review.findMany({
    where: {
      businessId: business.id,
      ...(includeFiltered ? {} : { visibilityStatus: "recommended" }),
    },
    orderBy: { createdAt: "desc" },
    include: reviewListInclude,
  });

  const votesByReview = await loadViewerVotesByReviewId(
    currentUserId,
    reviews.map((r) => r.id),
  );

  return NextResponse.json({
    reviews: reviews.map((r) => toReviewListItem(r, votesByReview.get(r.id) ?? [])),
  });
}
