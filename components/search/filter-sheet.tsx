"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterFields } from "./filter-fields";
import { applyFilterStateToParams, DEFAULT_FILTER_STATE, type FilterState } from "./filter-state";

export interface FilterSheetProps {
  filters: FilterState;
  resultCount: number;
  onApply: (filters: FilterState) => void;
}

// Mobile bottom-sheet filter drawer (02-CONTEXT.md D-08). Unlike
// FilterSidebar, edits are staged in local draft state and only committed
// (onApply) when the "Show {N} results" button is tapped — the sheet closes
// immediately after. While open, the apply button's count updates live via
// a debounced preview fetch against /api/search that never touches the
// committed URL/results list (02-UI-SPEC.md's dynamic-count apply button).
export function FilterSheet({ filters, resultCount, onApply }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(filters);
  const [previewCount, setPreviewCount] = useState(resultCount);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-seed the draft from the currently-committed filters every time the
  // sheet opens, so a previous session's abandoned (never-applied) edits
  // never leak into the next time it's opened.
  useEffect(() => {
    if (open) {
      setDraft(filters);
      setPreviewCount(resultCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function fetchPreviewCount(nextDraft: FilterState) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      applyFilterStateToParams(params, nextDraft, "recommended");
      params.delete("sort"); // preview-only fetch; sort doesn't affect count
      fetch(`/api/search?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json: { totalCount?: number } | null) => {
          if (json && typeof json.totalCount === "number") {
            setPreviewCount(json.totalCount);
          }
        })
        .catch(() => {
          // Preview count is a non-critical nicety — keep the last known
          // count rather than surfacing an error inside the sheet.
        });
    }, 300);
  }

  function handleDraftChange(patch: Partial<FilterState>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    fetchPreviewCount(next);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleClearAll() {
    setDraft(DEFAULT_FILTER_STATE);
    onApply(DEFAULT_FILTER_STATE);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11">
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <FilterFields filters={draft} onChange={handleDraftChange} />
        </div>
        <SheetFooter className="flex flex-row items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="min-h-11 px-2 text-sm text-muted-foreground underline"
          >
            Clear all
          </button>
          <Button
            type="button"
            onClick={handleApply}
            className="min-h-11 flex-1 bg-brand-accent text-white hover:bg-brand-accent/90"
          >
            Show {previewCount} results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default FilterSheet;
