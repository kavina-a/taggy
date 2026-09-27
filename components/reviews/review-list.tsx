"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ReviewCard } from "./review-card";
import { ReviewSortDropdown } from "./review-sort-dropdown";
import { RatingHistogram } from "./rating-histogram";
import { sortReviews, type ReviewSortOption } from "@/lib/reviews/sort-reviews";
import type { ReviewListItem } from "@/lib/types/review";

export interface ReviewListProps {
  businessSlug: string;
  /** Recommended-only reviews, already blended-sorted server-side (SSR initial order). */
  initialReviews: ReviewListItem[];
  /** REV-04: the REAL not_recommended count — 0 means the disclosure is omitted entirely. */
  notRecommendedCount: number;
  currentUserId: string | null;
  isOwner?: boolean;
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
  isOwner = false,
}: ReviewListProps) {
  const [sort, setSort] = useState<ReviewSortOption>("blended");
  const [expanded, setExpanded] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState<ReviewListItem[] | null>(null);
  const [loadingFiltered, setLoadingFiltered] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");

  // REV-05: apply the same pure sortReviews() the server used for the
  // initial blended order to whichever review set (main list or the
  // disclosure's filtered list) is currently displayed, for the
  // currently-selected option. Generic sortReviews<T>() returns the full
  // ReviewListItem shape back out directly — no separate reorder step.
  const sortedReviews = useMemo(() => {
    let base = sortReviews(initialReviews, sort);
    if (starFilter !== null) base = base.filter((r) => r.rating === starFilter);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      base = base.filter((r) => r.text?.toLowerCase().includes(kw));
    }
    return base;
  }, [initialReviews, sort, starFilter, keyword]);

  const sortedFiltered = useMemo(
    () => (filteredReviews ? sortReviews(filteredReviews, sort) : null),
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

  const hasActiveSearch = starFilter !== null || keyword.trim() !== "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl leading-[1.2] font-semibold">Reviews</h2>
        {initialReviews.length > 0 && <ReviewSortDropdown sort={sort} onSortChange={setSort} />}
      </div>

      {/* Rating Histogram */}
      {initialReviews.length > 0 && (
        <RatingHistogram
          reviews={initialReviews}
          activeFilter={starFilter}
          onFilterChange={setStarFilter}
        />
      )}

      {/* Keyword search within reviews */}
      {initialReviews.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search within reviews…"
            className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-9 pr-9 text-sm text-black placeholder:text-neutral-400 shadow-xs outline-none focus:border-[#D71616] focus:ring-2 focus:ring-[#D71616]/20 transition"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      {hasActiveSearch && sortedReviews.length === 0 ? (
        <p className="text-base leading-normal text-muted-foreground py-4 text-center">
          No reviews match your search. <button type="button" onClick={() => { setStarFilter(null); setKeyword(""); }} className="text-[#D71616] underline">Clear filters</button>
        </p>
      ) : sortedReviews.length === 0 ? (
        <p className="text-base leading-normal text-muted-foreground">
          No reviews yet. Be the first to write one!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {hasActiveSearch && (
            <p className="text-xs text-neutral-500">
              Showing {sortedReviews.length} of {initialReviews.length} review{initialReviews.length === 1 ? "" : "s"}
            </p>
          )}
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwnReview={currentUserId !== null && review.userId === currentUserId}
              currentUserId={currentUserId}
              isOwner={isOwner}
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
                      currentUserId={currentUserId}
                      isOwner={isOwner}
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

