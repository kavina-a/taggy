import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReviewSortDropdown } from "./review-sort-dropdown";

describe("ReviewSortDropdown", () => {
  it("shows the current sort's label", () => {
    render(<ReviewSortDropdown sort="blended" onSortChange={vi.fn()} />);
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("lists all four options and calls onSortChange with the selected value", async () => {
    const onSortChange = vi.fn();
    render(<ReviewSortDropdown sort="blended" onSortChange={onSortChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Sort by/i }));

    for (const label of ["Recommended", "Newest", "Highest Rated", "Lowest Rated"]) {
      expect(await screen.findByRole("menuitem", { name: label })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("menuitem", { name: "Newest" }));
    expect(onSortChange).toHaveBeenCalledWith("newest");
  });
});
