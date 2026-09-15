"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortOption } from "./filter-state";

export interface SortDropdownProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

// SRCH-04's exactly-4 sort options, in the locked order. "Recommended" is
// treated as the default whenever no sort param is present in the URL (the
// page-level hook already defaults `sort` to "recommended" before this
// component ever sees it).
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "most_reviewed", label: "Most Reviewed" },
  { value: "distance", label: "Distance" },
];

export function SortDropdown({ sort, onSortChange }: SortDropdownProps) {
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

export default SortDropdown;
