"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReviewSortOption } from "@/lib/reviews/sort-reviews";

export interface ReviewSortDropdownProps {
  sort: ReviewSortOption;
  onSortChange: (sort: ReviewSortOption) => void;
}

// REV-05's explicit sort override, in the locked order. "Recommended" is the
// default blended order (recency + reviewer credibility + a neutral
// helpfulness placeholder) — same label convention as SRCH-04's
// components/search/sort-dropdown.tsx "Recommended" default, reused
// deliberately so both surfaces speak the same vocabulary to a user.
const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: "blended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

export function ReviewSortDropdown({ sort, onSortChange }: ReviewSortDropdownProps) {
  const current = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 gap-1.5">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <span className="text-sm font-medium">{current.label}</span>
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => onSortChange(option.value)}>
            {option.value === sort ? (
              <CheckIcon className="size-4 text-brand-accent" />
            ) : (
              <span className="size-4" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ReviewSortDropdown;
