"use client";

import { FilterFields } from "./filter-fields";
import type { FilterState } from "./filter-state";

export interface FilterSidebarProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
}

// Desktop inline filter panel (02-CONTEXT.md D-08). Applies every change
// immediately — no explicit apply step, matching 02-UI-SPEC.md's desktop-
// sidebar convention (contrast with FilterSheet's staged apply-button flow).
export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-lg bg-secondary p-4" aria-label="Filters">
      <h2 className="text-xl leading-[1.2] font-semibold">Filters</h2>
      <FilterFields filters={filters} onChange={onChange} />
    </aside>
  );
}

export default FilterSidebar;
