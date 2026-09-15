import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Read surface for a business's reviews — built for the next chunk's UI
// (business page review list + "X reviews not currently recommended"
// disclosure link, REV-04) to consume. Defaults to `recommended` reviews
// only; `?includeFiltered=true` also returns `not_recommended` ones (never
// deleted per REV-04, just excluded from the default view/rating). Never
// includes `filterReason`/`filterSignals` — those are internal/audit-only
// fields (REV-06) not exposed to any public API caller.
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

  const reviews = await prisma.review.findMany({
    where: {
      businessId: business.id,
      ...(includeFiltered ? {} : { visibilityStatus: "recommended" }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      photos: { select: { id: true, url: true, caption: true } },
    },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      rating: r.rating,
      text: r.text,
      visitDate: r.visitDate,
      // Exposed deliberately: the UI needs to distinguish recommended vs.
      // not_recommended to render REV-04's disclosure grouping. This is NOT
      // the same secrecy boundary as filterReason/filterSignals below — a
      // *reader* seeing which bucket a review landed in is fine; it's only
      // the review's own AUTHOR who must never learn their own bucket in
      // real time (spec 6.3), and this endpoint is never called by the
      // create/edit response path that author sees.
      visibilityStatus: r.visibilityStatus,
      editedAt: r.editedAt,
      createdAt: r.createdAt,
      photos: r.photos,
    })),
  });
}
