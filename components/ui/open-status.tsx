import React from "react";
import { cn } from "@/lib/utils";

export interface OpenStatusProps {
  openNow?: boolean | null;
  openText?: string;
  closedText?: string;
  detail?: string;
  className?: string;
}

export function OpenStatus({
  openNow,
  openText = "Open now",
  closedText = "Closed",
  detail,
  className,
}: OpenStatusProps) {
  if (openNow === undefined || openNow === null) {
    return null;
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span
        className={cn(
          "font-semibold",
          openNow ? "text-[#008055]" : "text-[#D71616]",
        )}
      >
        {openNow ? openText : closedText}
      </span>
      {detail && <span className="text-muted-foreground">{detail}</span>}
    </span>
  );
}

export default OpenStatus;
