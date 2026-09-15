import { prisma } from "@/lib/prisma";
import { maxSimilarity } from "./text-similarity";
import type { ReviewFilterSignals } from "./review-filter";

// Trailing window for the burst-posting signal (spec 6.3 — a review-farm
// signature is reviewing many DIFFERENT businesses rapidly; this project
// only allows one review per user per business, so "burst" is measured
// across ALL of a user's reviews, any business, in this window).
const BURST_WINDOW_MS = 60 * 60 * 1000;

// How many of the reviewer's own most recent reviews to compare against for
// the text-similarity signal — bounded so this stays a cheap query even for
// a prolific reviewer.
const OWN_RECENT_REVIEWS_LIMIT = 10;

// Small platform-wide sample (most recent reviews by OTHER users) also
// compared for similarity, per this chunk's REV-06 spec note — catches a
// templated-review-farm pattern spread across multiple accounts, not just
// one account reusing its own text.
const PLATFORM_SAMPLE_SIZE = 20;

// Gathers every raw signal review-filter.ts's classifyReview needs, from the
// database, for one candidate review. Kept separate from classifyReview
// itself so the scoring logic stays a pure, DB-free, unit-testable function
// (lib/reviews/review-filter.test.ts) while this module owns the I/O.
export async function gatherReviewSignals(params: {
  userId: string;
  text: string;
  // When editing an existing review, exclude it from every count/comparison
  // below — otherwise a review always "matches itself" for similarity and
  // always counts itself in priorReviewCount/reviewsLastHour.
  excludeReviewId?: string;
}): Promise<ReviewFilterSignals> {
  const { userId, text, excludeReviewId } = params;
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - BURST_WINDOW_MS);
  const excludeSelf = excludeReviewId ? { id: { not: excludeReviewId } } : {};

  const [user, priorReviewCount, reviewsLastHour, ownRecentReviews, platformSample] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { createdAt: true } }),
      prisma.review.count({ where: { userId, ...excludeSelf } }),
      prisma.review.count({
        where: { userId, createdAt: { gte: oneHourAgo }, ...excludeSelf },
      }),
      prisma.review.findMany({
        where: { userId, ...excludeSelf },
        orderBy: { createdAt: "desc" },
        take: OWN_RECENT_REVIEWS_LIMIT,
        select: { text: true },
      }),
      prisma.review.findMany({
        where: { userId: { not: userId }, ...excludeSelf },
        orderBy: { createdAt: "desc" },
        take: PLATFORM_SAMPLE_SIZE,
        select: { text: true },
      }),
    ]);

  const accountAgeHours = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60);
  const comparisonTexts = [...ownRecentReviews, ...platformSample].map((r) => r.text);

  return {
    accountAgeHours,
    isFirstReview: priorReviewCount === 0,
    priorReviewCount,
    reviewsLastHour,
    maxTextSimilarity: maxSimilarity(text, comparisonTexts),
  };
}
