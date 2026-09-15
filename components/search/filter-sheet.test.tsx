import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FilterSheet } from "./filter-sheet";
import { DEFAULT_FILTER_STATE } from "./filter-state";

// Radix Dialog (Sheet is built on it) needs these jsdom polyfills for
// open/close + focus handling — same pattern already established in
// components/layout/language-switcher.test.tsx for Radix Select.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("FilterSheet", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ businesses: [], totalCount: 12, page: 1, totalPages: 1 }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens via the Filters trigger button and renders the shared filter fields", () => {
    render(<FilterSheet filters={DEFAULT_FILTER_STATE} resultCount={24} onApply={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("does not call onApply while adjusting filters inside the sheet, only on the apply-button tap", () => {
    const onApply = vi.fn();
    render(<FilterSheet filters={DEFAULT_FILTER_STATE} resultCount={24} onApply={onApply} />);
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Open now" }));

    expect(onApply).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Show \d+ results/ }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ openNow: true }));
  });

  it("shows the committed resultCount initially and updates to a live candidate-count preview as filters change", async () => {
    render(<FilterSheet filters={DEFAULT_FILTER_STATE} resultCount={24} onApply={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByRole("button", { name: "Show 24 results" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Open now" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Show 12 results" })).toBeInTheDocument();
    });
  });

  it("'Clear all' resets to default filters and applies immediately", () => {
    const onApply = vi.fn();
    render(
      <FilterSheet
        filters={{ ...DEFAULT_FILTER_STATE, openNow: true, categories: ["restaurant"] }}
        resultCount={5}
        onApply={onApply}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(onApply).toHaveBeenCalledWith(DEFAULT_FILTER_STATE);
  });
});
