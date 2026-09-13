"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  BusinessHoursRow,
  BusinessHoursOverrideRow,
} from "@/lib/types/business";

export interface HoursAccordionProps {
  hours: BusinessHoursRow[];
  overrides: BusinessHoursOverrideRow[];
  openNow: boolean;
}

// Sun-Sat, matching dayOfWeek 0 = Sunday .. 6 = Saturday (lib/hours).
const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Formats a locked "HH:mm" 24-hour string into a 12-hour "h:mm AM/PM" display string.
function formatTime(hhmm: string): string {
  const [hour, minute] = hhmm.split(":").map(Number);
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function formatShift(row: BusinessHoursRow): string {
  return `${formatTime(row.openTime)} - ${formatTime(row.closeTime)}`;
}

export function HoursAccordion({ hours, overrides, openNow }: HoursAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Badge
        className={
          openNow
            ? "bg-status-open text-white"
            : "bg-status-closed text-white"
        }
      >
        {openNow ? "Open now" : "Closed"}
      </Badge>

      <Accordion
        type="single"
        collapsible
        value={isOpen ? "hours" : ""}
        onValueChange={(value) => setIsOpen(value === "hours")}
      >
        <AccordionItem value="hours">
          <AccordionTrigger
            className="min-h-11"
            aria-label={isOpen ? "Collapse hours" : "Expand hours"}
          >
            Hours
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              {DAY_LABELS.map((label, dayOfWeek) => {
                const dayShifts = hours.filter(
                  (h) => h.dayOfWeek === dayOfWeek,
                );
                return (
                  <li
                    key={dayOfWeek}
                    className="flex items-baseline justify-between gap-4 text-base"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-right text-foreground">
                      {dayShifts.length > 0
                        ? dayShifts.map(formatShift).join(", ")
                        : "Closed"}
                    </span>
                  </li>
                );
              })}
            </ul>
            {overrides.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Hours may vary on holidays.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default HoursAccordion;
