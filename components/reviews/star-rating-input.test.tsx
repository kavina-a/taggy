import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StarRatingInput } from "./star-rating-input";

describe("StarRatingInput", () => {
  it("renders 5 stars, each an accessible, 44px-min button", () => {
    render(<StarRatingInput value={0} onChange={vi.fn()} />);

    for (let n = 1; n <= 5; n++) {
      const star = screen.getByRole("radio", { name: `Rate ${n} star${n === 1 ? "" : "s"}` });
      expect(star).toBeInTheDocument();
      expect(star.className).toMatch(/min-h-11/);
      expect(star.className).toMatch(/min-w-11/);
    }
  });

  it("marks stars up to and including the current value as selected", () => {
    render(<StarRatingInput value={3} onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Rate 1 star" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Rate 3 stars" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Rate 4 stars" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onChange with the clicked star's value", () => {
    const onChange = vi.fn();
    render(<StarRatingInput value={0} onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "Rate 4 stars" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<StarRatingInput value={0} onChange={onChange} disabled />);

    fireEvent.click(screen.getByRole("radio", { name: "Rate 4 stars" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("exposes a radiogroup with an accessible name", () => {
    render(<StarRatingInput value={0} onChange={vi.fn()} label="Your rating" />);

    expect(screen.getByRole("radiogroup", { name: "Your rating" })).toBeInTheDocument();
  });
});
