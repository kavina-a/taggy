import React from "react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  rating: number | null | undefined;
  reviewCount?: number | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showNumber?: boolean;
  showCount?: boolean;
  className?: string;
}

const BOX_SIZES = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

const STAR_SIZES = {
  xs: "size-2.5",
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
  xl: "size-5",
};

export function getRatingTierColor(rating: number): string {
  if (rating >= 4.75) return "#FB433C";
  if (rating >= 3.75) return "#FF643D";
  if (rating >= 2.75) return "#FF8742";
  if (rating >= 1.75) return "#FFAD48";
  if (rating >= 0.75) return "#FFCC4B";
  return "#C8C9CA";
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return count.toString();
}

/**
 * Yelp-style 5-box Star Rating component with tier colors, half-star gradient fills,
 * and optional review count.
 */
export function StarRating({
  rating,
  reviewCount,
  size = "md",
  showNumber = false,
  showCount = true,
  className,
}: StarRatingProps) {
  if (rating == null || rating <= 0) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <span className="flex items-center gap-0.5" aria-label="No reviews yet">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center justify-center rounded-[3px] bg-[#C8C9CA] text-white",
                BOX_SIZES[size],
              )}
            >
              <svg className={cn("fill-current", STAR_SIZES[size])} viewBox="0 0 20 20">
                <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
              </svg>
            </span>
          ))}
        </span>
        {showCount && <span className="text-muted-foreground">No reviews yet</span>}
      </div>
    );
  }

  const rounded = Math.round(rating * 2) / 2; // snap to nearest 0.5
  const tierColor = getRatingTierColor(rounded);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${rounded.toFixed(1)} star rating`}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          let backgroundStyle: React.CSSProperties = { backgroundColor: "#C8C9CA" };

          if (rounded >= starIndex) {
            // Full star
            backgroundStyle = { backgroundColor: tierColor };
          } else if (rounded >= starIndex - 0.5) {
            // Half star
            backgroundStyle = {
              background: `linear-gradient(to right, ${tierColor} 50%, #C8C9CA 50%)`,
            };
          }

          return (
            <span
              key={starIndex}
              style={backgroundStyle}
              className={cn(
                "inline-flex items-center justify-center rounded-[3px] text-white transition-transform",
                BOX_SIZES[size],
              )}
            >
              <svg className={cn("fill-current", STAR_SIZES[size])} viewBox="0 0 20 20">
                <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
              </svg>
            </span>
          );
        })}
      </div>

      {showNumber && (
        <span className="font-semibold text-foreground text-sm leading-none">
          {rounded.toFixed(1)}
        </span>
      )}

      {showCount && reviewCount != null && reviewCount > 0 && (
        <span className="text-xs text-muted-foreground font-normal leading-none">
          ({formatReviewCount(reviewCount)})
        </span>
      )}
    </div>
  );
}

export default StarRating;
