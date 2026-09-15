import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReviewSortDropdown } from "./review-sort-dropdown";

// Radix DropdownMenu needs these jsdom polyfills for open/select handling —
// same pattern established in components/search/sort-dropdown.test.tsx.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

// DropdownMenuTrigger opens on pointerdown (not click) in Radix — open via a
// keyboard Enter press instead, reliable under jsdom's fireEvent.click,
// which never dispatches pointerdown.
function openMenu() {
  fireEvent.keyDown(screen.getByRole("button", { name: /Sort by/i }), { key: "Enter" });
}

describe("ReviewSortDropdown", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the current sort's label", () => {
    render(<ReviewSortDropdown sort="blended" onSortChange={vi.fn()} />);
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("lists exactly the 4 sort options in order when opened", () => {
    render(<ReviewSortDropdown sort="blended" onSortChange={vi.fn()} />);
    openMenu();

    const items = screen.getAllByRole("menuitem");
    expect(items.map((el) => el.textContent)).toEqual([
      "Recommended",
      "Newest",
      "Highest Rated",
      "Lowest Rated",
    ]);
  });

  it("selecting an option calls onSortChange with that option's value", () => {
    const onSortChange = vi.fn();
    render(<ReviewSortDropdown sort="blended" onSortChange={onSortChange} />);
    openMenu();
    fireEvent.click(screen.getByText("Newest"));
    expect(onSortChange).toHaveBeenCalledWith("newest");
  });
});
