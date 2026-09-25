import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { ReviewComposer } from "./review-composer";

const LONG_ENOUGH_TEXT =
  "This place has great food, friendly staff, and a cozy atmosphere that keeps me coming back.";

describe("ReviewComposer", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects submission with no rating and short text client-side, never calling fetch", async () => {
    render(<ReviewComposer businessId="biz_1" existingReview={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("posts a new review with rating shown/required first, then text, and shows a generic success message", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "rev_1", businessId: "biz_1", rating: 5, text: LONG_ENOUGH_TEXT, createdAt: "2026-09-15T00:00:00.000Z" }),
    });

    render(<ReviewComposer businessId="biz_1" existingReview={null} />);

    fireEvent.click(screen.getByRole("radio", { name: "Rate 5 stars" }));
    fireEvent.change(screen.getByLabelText(/Your review/i), {
      target: { value: LONG_ENOUGH_TEXT },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() => {
      expect(screen.getByText("Thanks for your review!")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/reviews",
      expect.objectContaining({ method: "POST" }),
    );
    const [, requestInit] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(requestInit.body as string);
    expect(body.businessId).toBe("biz_1");
    expect(body.rating).toBe(5);
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows the API's verbatim error message on a validation/MOD-01 failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Your review could not be published." }),
    });

    render(<ReviewComposer businessId="biz_1" existingReview={null} />);

    fireEvent.click(screen.getByRole("radio", { name: "Rate 3 stars" }));
    fireEvent.change(screen.getByLabelText(/Your review/i), {
      target: { value: LONG_ENOUGH_TEXT },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() => {
      expect(screen.getByText("Your review could not be published.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Thanks for your review!")).not.toBeInTheDocument();
  });

  it("on a 409 (already reviewed) refreshes instead of showing a dead-end error", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: "You have already reviewed this business." }),
    });

    render(<ReviewComposer businessId="biz_1" existingReview={null} />);

    fireEvent.click(screen.getByRole("radio", { name: "Rate 3 stars" }));
    fireEvent.change(screen.getByLabelText(/Your review/i), {
      target: { value: LONG_ENOUGH_TEXT },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("offers a file picker for photos instead of a URL paste field", () => {
    render(<ReviewComposer businessId="biz_1" existingReview={null} />);

    expect(screen.getByRole("button", { name: "Add photos" })).toBeInTheDocument();
    expect(screen.getByLabelText("Add photos")).toHaveAttribute("type", "file");
    expect(screen.queryByPlaceholderText("https://...")).not.toBeInTheDocument();
  });

  it("starts collapsed with an Edit button when an existing review is passed, and PATCHes on submit once expanded", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "rev_1", businessId: "biz_1", rating: 4, text: LONG_ENOUGH_TEXT, createdAt: "2026-09-15T00:00:00.000Z" }),
    });

    render(
      <ReviewComposer
        businessId="biz_1"
        existingReview={{ id: "rev_1", rating: 4, text: LONG_ENOUGH_TEXT, photos: [] }}
      />,
    );

    expect(screen.queryByRole("button", { name: "Submit review" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit your review" }));

    expect(screen.getByRole("radio", { name: "Rate 4 stars" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/reviews/rev_1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });
});
