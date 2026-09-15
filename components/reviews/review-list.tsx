"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ReviewCard } from "./review-card";
import { ReviewSortDropdown } from "./review-sort-dropdown";
import { sortReviews, type ReviewSortOption, type SortableReview } from "@/lib/reviews/sort-reviews";
import type { ReviewListItem } from "@/lib/types/review";

export interface ReviewListProps {
  businessSlug: string;
  /** Recommended-only reviews, already blended-sorted server-side (SSR initial order). */
  initialReviews: ReviewListItem[];
  /** REV-04: the REAL not_recommended count — 0 means the disclosure is omitted entirely. */
  notRecommendedCount: number;
  currentUserId: string | null;
}

function toSortable(review: ReviewListItem): SortableReview {
  return {
    id: review.id,
    rating: review.rating,
    createdAt: review.createdAt,
    userAccountCreatedAt: review.userAccountCreatedAt,
    userReviewCount: review.userReviewCount,
  };
}

// REV-05: apply the same pure sortReviews() the server used for the initial
// blended order to whichever review set (main list or the disclosure's
// filtered list) is currently displayed, for the currently-selected option.
function applySort(reviews: ReviewListItem[], sort: ReviewSortOption): ReviewListItem[] {
  const order = sortReviews(reviews.map(toSortable), sort);
  const byId = new Map(reviews.map((r) => [r.id, r]));
  return order.map((entry) => byId.get(entry.id)!);
}

// REV-04: the disclosure link is NEVER hidden or its count faked — omitted
// entirely only when the real count is 0 (a misleading "0 reviews" link
// would violate "never silently hide the count or the access path").
// Expands inline (this project's existing accordion pattern, see
// components/business/hours-accordion.tsx) and lazily fetches the filtered
// set only on first expand, via the same public GET endpoint readers use.
export function ReviewList({
  businessSlug,
  initialReviews,
  notRecommendedCount,
  currentUserId,
}: ReviewListProps) {
  const [sort, setSort] = useState<ReviewSortOption>("blended");
  const [expanded, setExpanded] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState<ReviewListItem[] | null>(null);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  const sortedReviews = useMemo(() => applySort(initialReviews, sort), [initialReviews, sort]);
  const sortedFiltered = useMemo(
    () => (filteredReviews ? applySort(filteredReviews, sort) : null),
    [filteredReviews, sort],
  );

  async function handleAccordionChange(value: string) {
    const nowExpanded = value === "not-recommended";
    setExpanded(nowExpanded);
    if (nowExpanded && filteredReviews === null) {
      setLoadingFiltered(true);
      try {
        const res = await fetch(`/api/businesses/${businessSlug}/reviews?includeFiltered=true`);
        const data = await res.json();
        const onlyFiltered: ReviewListItem[] = (data.reviews ?? []).filter(
          (r: ReviewListItem) => r.visibilityStatus === "not_recommended",
        );
        setFilteredReviews(onlyFiltered);
      } finally {
        setLoadingFiltered(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl leading-[1.2] font-semibold">Reviews</h2>
        {initialReviews.length > 0 && <ReviewSortDropdown sort={sort} onSortChange={setSort} />}
      </div>

      {sortedReviews.length === 0 ? (
        <p className="text-base leading-normal text-muted-foreground">
          No reviews yet. Be the first to write one!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwnReview={currentUserId !== null && review.userId === currentUserId}
            />
          ))}
        </div>
      )}

      {notRecommendedCount > 0 && (
        <Accordion
          type="single"
          collapsible
          value={expanded ? "not-recommended" : ""}
          onValueChange={handleAccordionChange}
        >
          <AccordionItem value="not-recommended">
            <AccordionTrigger className="min-h-11 text-sm text-muted-foreground">
              {notRecommendedCount} review{notRecommendedCount === 1 ? "" : "s"} not currently
              recommended
            </AccordionTrigger>
            <AccordionContent>
              {loadingFiltered && (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
              {sortedFiltered && (
                <div className="flex flex-col gap-3">
                  {sortedFiltered.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isOwnReview={currentUserId !== null && review.userId === currentUserId}
                      variant="filtered"
                    />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

export default ReviewList;
