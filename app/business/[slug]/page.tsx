import { notFound } from "next/navigation";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { computeOpenNow } from "@/lib/hours/compute-open-now";
import { getSession } from "@/lib/session";
import { sortReviews } from "@/lib/reviews/sort-reviews";
import { BusinessPageView } from "@/components/business/business-page";
import type { ExistingReviewForComposer } from "@/components/reviews/review-composer";
import type { BusinessDetail } from "@/lib/types/business";
import type { ReviewListItem } from "@/lib/types/review";
import type { Prisma } from "@/lib/generated/prisma/client";

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

// Same include shape used for both the recommended-review query and the
// current user's own review lookup below, so the mapper stays a single
// source of truth for the Prisma-row -> ReviewListItem shape.
const reviewInclude = {
  user: { select: { name: true, createdAt: true, _count: { select: { reviews: true } } } },
  photos: { select: { id: true, url: true, caption: true } },
} satisfies Prisma.ReviewInclude;

type ReviewWithRelations = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

function toReviewListItem(review: ReviewWithRelations): ReviewListItem {
  return {
    id: review.id,
    userId: review.userId,
    userName: review.user.name,
    userAccountCreatedAt: review.user.createdAt.toISOString(),
    userReviewCount: review.user._count.reviews,
    rating: review.rating,
    text: review.text,
    visitDate: review.visitDate ? review.visitDate.toISOString() : null,
    visibilityStatus: review.visibilityStatus,
    editedAt: review.editedAt ? review.editedAt.toISOString() : null,
    createdAt: review.createdAt.toISOString(),
    photos: review.photos,
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { hours: true, hoursOverrides: true, photos: true },
  });

  if (!business) {
    notFound();
  }

  const session = await getSession();
  const currentUserId = session.userId ?? null;

  // Direct Prisma queries in the page component, matching this project's
  // established data-fetching pattern (never an internal fetch() to this
  // app's own API routes from a Server Component).
  const [recommendedReviews, notRecommendedCount, ownReview] = await Promise.all([
    prisma.review.findMany({
      where: { businessId: business.id, visibilityStatus: "recommended" },
      orderBy: { createdAt: "desc" },
      include: reviewInclude,
    }),
    prisma.review.count({
      where: { businessId: business.id, visibilityStatus: "not_recommended" },
    }),
    currentUserId
      ? prisma.review.findFirst({
          where: { businessId: business.id, userId: currentUserId },
          include: { photos: { select: { id: true, url: true, caption: true } } },
        })
      : Promise.resolve(null),
  ]);

  // REV-05: blended default order (recency + reviewer credibility + a
  // neutral helpfulness placeholder) computed once, server-side, for the
  // initial SSR render — ReviewList's sort dropdown re-applies the same
  // pure function client-side for the Newest/Highest/Lowest override.
  const reviews = sortReviews(recommendedReviews.map(toReviewListItem), "blended");

  // REV-03/spec 6.3: this value is used ONLY to decide the composer's
  // create-vs-edit starting mode — never to tell the author their own
  // visibilityStatus (ReviewComposer/ExistingReviewForComposer's shape
  // deliberately excludes it, same secrecy boundary as
  // lib/reviews/author-review-response.ts).
  const existingReview: ExistingReviewForComposer | null = ownReview
    ? {
        id: ownReview.id,
        rating: ownReview.rating,
        text: ownReview.text,
        photos: ownReview.photos.map((p) => ({ url: p.url })),
      }
    : null;

  const detail: BusinessDetail = {
    id: business.id,
    slug: business.slug,
    name: business.name,
    description: business.description,
    primaryCategories: business.primaryCategories,
    secondaryCategories: business.secondaryCategories,
    district: business.district,
    addressFreeText: business.addressFreeText,
    latitude: business.latitude,
    longitude: business.longitude,
    attributes: (business.attributes ?? {}) as Record<string, unknown>,
    hours: business.hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      crossesMidnight: h.crossesMidnight,
    })),
    hoursOverrides: business.hoursOverrides.map((o) => ({
      date: o.date.toISOString().slice(0, 10),
      isClosed: o.isClosed,
      openTime: o.openTime,
      closeTime: o.closeTime,
      crossesMidnight: o.crossesMidnight,
    })),
    photos: business.photos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: p.caption,
      sortOrder: p.sortOrder,
      isMenuPhoto: p.isMenuPhoto,
    })),
  };

  // Computed server-side with a hardcoded Asia/Colombo zone (never the
  // server's OS/env timezone) — see 01-RESEARCH.md's anti-pattern warning
  // against computing "open now" client-side.
  const openNow = computeOpenNow(
    detail.hours,
    detail.hoursOverrides,
    DateTime.now().setZone("Asia/Colombo"),
  );

  return (
    <BusinessPageView
      business={detail}
      openNow={openNow}
      reviews={reviews}
      notRecommendedCount={notRecommendedCount}
      currentUserId={currentUserId}
      existingReview={existingReview}
    />
  );
}
