import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FilterSidebar } from "./filter-sidebar";
import { DEFAULT_FILTER_STATE } from "./filter-state";

describe("FilterSidebar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the category checkbox list sourced from categoryTaxonomy", () => {
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={vi.fn()} />);
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
    expect(screen.getByText("Tailoring & Garments")).toBeInTheDocument();
  });

  it("checking a category calls onChange immediately with the updated categories array", () => {
    const onChange = vi.fn();
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Restaurants" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ categories: ["restaurant"] }));
  });

  it("shows category-conditional boolean attribute checkboxes only when a matching category is checked", () => {
    const onChange = vi.fn();
    const { rerender } = render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    expect(screen.queryByText("Delivery")).not.toBeInTheDocument();

    rerender(
      <FilterSidebar filters={{ ...DEFAULT_FILTER_STATE, categories: ["restaurant"] }} onChange={onChange} />,
    );
    expect(screen.getByText("Delivery")).toBeInTheDocument();

    rerender(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    expect(screen.queryByText("Delivery")).not.toBeInTheDocument();
  });

  it("renders 'Any' enabled and the three above-Any rating chips visibly disabled with an explanatory title", () => {
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Any" })).not.toBeDisabled();

    for (const label of ["3+", "4+", "4.5+"]) {
      const chip = screen.getByRole("button", { name: label });
      expect(chip).toBeDisabled();
      expect(chip).toHaveAttribute("title", "Ratings launch in a future update");
    }
  });

  it("clicking a disabled rating chip never calls onChange", () => {
    const onChange = vi.fn();
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "4+" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggling 'Open now' calls onChange with openNow true", () => {
    const onChange = vi.fn();
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Open now" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ openNow: true }));
  });

  it("toggling a price tier chip calls onChange with the updated priceTiers array", () => {
    const onChange = vi.fn();
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "$$" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ priceTiers: [2] }));
  });

  it("moving the distance slider calls onChange with a radiusKm from the discrete stop list", () => {
    const onChange = vi.fn();
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    const slider = screen.getByRole("slider", { name: "Distance radius" });
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ radiusKm: expect.any(Number) }));
    const calledWith = onChange.mock.calls[0][0].radiusKm;
    expect([1, 3, 5, 10, 25]).toContain(calledWith);
  });
});
