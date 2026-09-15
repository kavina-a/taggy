import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SortDropdown } from "./sort-dropdown";

// Radix DropdownMenu needs these jsdom polyfills for open/select handling —
// same pattern established in components/layout/language-switcher.test.tsx.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

// DropdownMenuTrigger opens on pointerdown (not click) in Radix, so tests
// open it via a keyboard Enter press instead — both a faithful keyboard-
// accessibility interaction and reliable under jsdom's fireEvent.click,
// which never dispatches pointerdown.
function openMenu() {
  fireEvent.keyDown(
    screen.getByRole("button", { name: /Sort by[\s\S]*Recommended|Sort by[\s\S]*Distance/ }),
    { key: "Enter" },
  );
}

describe("SortDropdown", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows 'Sort by' with 'Recommended' as the current value by default", () => {
    render(<SortDropdown sort="recommended" onSortChange={vi.fn()} />);
    expect(screen.getByText("Sort by")).toBeInTheDocument();
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("renders exactly the 4 sort options in order when opened", () => {
    render(<SortDropdown sort="recommended" onSortChange={vi.fn()} />);
    openMenu();

    const items = screen.getAllByRole("menuitem");
    expect(items.map((el) => el.textContent)).toEqual([
      "Recommended",
      "Highest Rated",
      "Most Reviewed",
      "Distance",
    ]);
  });

  it("selecting an option calls onSortChange with that option's value", () => {
    const onSortChange = vi.fn();
    render(<SortDropdown sort="recommended" onSortChange={onSortChange} />);
    openMenu();
    fireEvent.click(screen.getByText("Highest Rated"));
    expect(onSortChange).toHaveBeenCalledWith("highest_rated");
  });

  it("shows the current selection's label next to 'Sort by' for a non-default sort", () => {
    render(<SortDropdown sort="distance" onSortChange={vi.fn()} />);
    expect(screen.getByText("Sort by")).toBeInTheDocument();
    expect(screen.getByText("Distance")).toBeInTheDocument();
  });
});
