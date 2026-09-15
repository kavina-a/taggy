import type { Review } from "@/lib/generated/prisma/client";

// The single shared shape returned to a review's OWN author by both
// POST /api/reviews and PATCH /api/reviews/[id] — spec 6.3's most important
// rule: this shape is IDENTICAL regardless of the review-filter's outcome.
// Never add `visibilityStatus`, `filterReason`, or `filterSignals` here, and
// never branch this function's output on those fields — a single shared
// serializer is the enforcement mechanism, not a promise kept by two
// separately-hand-written route handlers that could drift.
export interface AuthorReviewResponse {
  id: string;
  businessId: string;
  rating: number;
  text: string;
  createdAt: Date;
}

export function toAuthorReviewResponse(review: Review): AuthorReviewResponse {
  return {
    id: review.id,
    businessId: review.businessId,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt,
  };
}
