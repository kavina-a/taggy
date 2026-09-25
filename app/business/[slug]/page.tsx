import { notFound } from "next/navigation";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { computeOpenNow } from "@/lib/hours/compute-open-now";
import { getSession } from "@/lib/session";
import { sortReviews } from "@/lib/reviews/sort-reviews";
import { reviewListInclude, toReviewListItem } from "@/lib/reviews/to-review-list-item";
import { loadViewerVotesByReviewId } from "@/lib/reviews/load-viewer-votes";
import { loadQuestionsForBusiness } from "@/lib/qa/load-questions";
import { ensureDefaultCollection } from "@/lib/collections/ensure-default";
import { loadRelatedBusinesses } from "@/lib/home/load-rails";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestLanguage } from "@/lib/i18n/get-request-language";
import { BusinessPageView } from "@/components/business/business-page";
import type { ExistingReviewForComposer } from "@/components/reviews/review-composer";
import type { BusinessDetail } from "@/lib/types/business";
import type { CollectionMembership } from "@/lib/types/collection";

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
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

  const [recommendedReviews, notRecommendedCount, ownReview, questions] = await Promise.all([
    prisma.review.findMany({
      where: { businessId: business.id, visibilityStatus: "recommended" },
      orderBy: { createdAt: "desc" },
      include: reviewListInclude,
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
    loadQuestionsForBusiness(business.id, business.claimedByUserId, currentUserId),
  ]);

  const votesByReview = await loadViewerVotesByReviewId(
    currentUserId,
    recommendedReviews.map((r) => r.id),
  );

  const reviews = sortReviews(
    recommendedReviews.map((r) => toReviewListItem(r, votesByReview.get(r.id) ?? [])),
    "blended",
  );

  // REV-03/spec 6.3: used ONLY to decide the composer's create-vs-edit
  // starting mode — never to tell the author their own visibilityStatus.
  const existingReview: ExistingReviewForComposer | null = ownReview
    ? {
        id: ownReview.id,
        rating: ownReview.rating,
        text: ownReview.text,
        photos: ownReview.photos.map((p) => ({ url: p.url })),
      }
    : null;

  let collectionMemberships: CollectionMembership[] = [];
  if (currentUserId) {
    const defaultCollection = await ensureDefaultCollection(currentUserId);
    const collections = await prisma.collection.findMany({
      where: { userId: currentUserId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      include: {
        items: { where: { businessId: business.id }, select: { id: true } },
      },
    });
    if (collections.length === 0) {
      collectionMemberships = [
        { id: defaultCollection.id, name: defaultCollection.name, containsBusiness: false },
      ];
    } else {
      collectionMemberships = collections.map((c) => ({
        id: c.id,
        name: c.name,
        containsBusiness: c.items.length > 0,
      }));
    }
  }

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
    phone: business.phone,
    claimedByUserId: business.claimedByUserId,
    claimedAt: business.claimedAt ? business.claimedAt.toISOString() : null,
    consumerAlert: business.consumerAlert,
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

  const openNow = computeOpenNow(
    detail.hours,
    detail.hoursOverrides,
    DateTime.now().setZone("Asia/Colombo"),
  );

  const [relatedBusinesses, lang] = await Promise.all([
    loadRelatedBusinesses(business.id, business.primaryCategories[0]),
    getRequestLanguage(),
  ]);
  const copy = getDictionary(lang);

  return (
    <BusinessPageView
      business={detail}
      openNow={openNow}
      reviews={reviews}
      notRecommendedCount={notRecommendedCount}
      currentUserId={currentUserId}
      existingReview={existingReview}
      isOwner={currentUserId !== null && business.claimedByUserId === currentUserId}
      questions={questions}
      collectionMemberships={collectionMemberships}
      relatedBusinesses={relatedBusinesses}
      copy={copy}
    />
  );
}
