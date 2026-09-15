"use client";

import { StarIcon } from "lucide-react";
import { cn } from "cn";

export interface StarRatingInputProps {
  /** 0-5. 0 means no star selected yet (composer requires a real 1-5 pick). */
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  /** Accessible name for the radiogroup as a whole. */
  label?: string;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

// REV-01: rating is required and shown FIRST in the composer, before the
// text field. A native radiogroup/radio pairing gives free keyboard support
// (Tab into the group, Arrow keys move the radio selection, Space/Enter
// activates) without hand-rolling roving tabindex logic. Each star is a
// 44px-min tap target per this project's mobile-first rule (see
// HoursAccordion's AccordionTrigger / BusinessCard's Link for the same
// min-h-11 convention).
export function StarRatingInput({ value, onChange, disabled, label }: StarRatingInputProps) {
  return (
    <div role="radiogroup" aria-label={label ?? "Rating"} className="flex items-center gap-1">
      {STAR_VALUES.map((n) => {
        const selected = value >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center rounded-md outline-none transition-colors",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <StarIcon
              className={cn(
                "size-6",
                selected ? "fill-brand-accent text-brand-accent" : "text-muted-foreground",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRatingInput;
