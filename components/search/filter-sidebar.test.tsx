import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FilterSidebar } from "./filter-sidebar";
import { DEFAULT_FILTER_STATE } from "./filter-state";

// Radix Slider (used by the shared Distance filter field) measures its
// track via ResizeObserver, which jsdom doesn't implement.
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

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

  it("renders 'Any' and the three above-Any rating chips all enabled (Phase 3 — real rating data exists)", () => {
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={vi.fn()} />);
    for (const label of ["Any", "3+", "4+", "4.5+"]) {
      expect(screen.getByRole("button", { name: label })).not.toBeDisabled();
    }
  });

  it("clicking a rating chip calls onChange with the selected threshold", () => {
    const onChange = vi.fn();
    render(<FilterSidebar filters={DEFAULT_FILTER_STATE} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "4+" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ rating: "4" }));
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
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ radiusKm: expect.any(Number) }));
    const calledWith = onChange.mock.calls[0][0].radiusKm;
    expect([1, 3, 5, 10, 25]).toContain(calledWith);
  });
});
