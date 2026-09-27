"use client";

import { cn } from "cn";
import type { ReviewListItem } from "@/lib/types/review";

interface RatingHistogramProps {
  reviews: ReviewListItem[];
  activeFilter: number | null;
  onFilterChange: (star: number | null) => void;
}

export function RatingHistogram({ reviews, activeFilter, onFilterChange }: RatingHistogramProps) {
  const total = reviews.length;
  if (total === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="text-4xl font-extrabold text-neutral-900 leading-none">
          {avg.toFixed(1)}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} className="size-4" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z"
                  fill={n <= Math.round(avg) ? "#D71616" : "#D5D5D5"}
                />
              </svg>
            ))}
          </span>
          <span className="text-xs text-neutral-500">
            Based on {total} {total === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {counts.map(({ star, count }) => {
          const pct = (count / maxCount) * 100;
          const isActive = activeFilter === star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onFilterChange(isActive ? null : star)}
              className={cn(
                "group flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors",
                isActive ? "bg-[#D71616]/8" : "hover:bg-neutral-50",
              )}
              aria-pressed={isActive}
              aria-label={`Filter by ${star} star${star === 1 ? "" : "s"} (${count} review${count === 1 ? "" : "s"})`}
            >
              <span
                className={cn(
                  "w-12 text-right text-xs font-semibold shrink-0",
                  isActive ? "text-[#D71616]" : "text-neutral-500 group-hover:text-neutral-800",
                )}
              >
                {star} star{star === 1 ? "" : "s"}
              </span>
              <div className="relative h-2.5 flex-1 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-300",
                    isActive ? "bg-[#D71616]" : "bg-[#D71616]/50 group-hover:bg-[#D71616]/80",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={cn(
                  "w-5 text-left text-xs font-medium shrink-0 tabular-nums",
                  isActive ? "text-[#D71616]" : "text-neutral-400",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {activeFilter !== null && (
        <button
          type="button"
          onClick={() => onFilterChange(null)}
          className="mt-1 self-start text-xs font-semibold text-[#D71616] hover:underline"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
