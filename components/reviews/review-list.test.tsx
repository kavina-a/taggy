import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

import { ReviewList } from "./review-list";
import type { ReviewListItem } from "@/lib/types/review";

function makeReview(overrides: Partial<ReviewListItem> & { id: string }): ReviewListItem {
  return {
    userId: "user_other",
    userName: "Reviewer",
    userAccountCreatedAt: "2025-01-01T00:00:00.000Z",
    userReviewCount: 1,
    rating: 4,
    text: "A perfectly fine review with plenty of detail about the visit and experience.",
    visitDate: null,
    visibilityStatus: "recommended",
    editedAt: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    photos: [],
    usefulCount: 0,
    funnyCount: 0,
    coolCount: 0,
    viewerVotes: [],
    ownerResponse: null,
    ...overrides,
  };
}

describe("ReviewList", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an empty state when there are no recommended reviews", () => {
    render(
      <ReviewList
        businessSlug="test-cafe"
        initialReviews={[]}
        notRecommendedCount={0}
        currentUserId={null}
      />,
    );

    expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
  });

  it("renders each review and shows Edit only for the current user's own review", () => {
    render(
      <ReviewList
        businessSlug="test-cafe"
        initialReviews={[
          makeReview({ id: "r1", userId: "user_me" }),
          makeReview({ id: "r2", userId: "user_other" }),
        ]}
        notRecommendedCount={0}
        currentUserId="user_me"
      />,
    );

    expect(screen.getAllByRole("link", { name: "Edit" })).toHaveLength(1);
  });

  it("never shows a disclosure link when the not-recommended count is 0", () => {
    render(
      <ReviewList
        businessSlug="test-cafe"
        initialReviews={[makeReview({ id: "r1" })]}
        notRecommendedCount={0}
        currentUserId={null}
      />,
    );

    expect(screen.queryByText(/not currently recommended/i)).not.toBeInTheDocument();
  });

  it("shows the real not-recommended count and expands to fetch+show those reviews", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        reviews: [
          makeReview({ id: "r1", visibilityStatus: "recommended" }),
          makeReview({
            id: "hidden-1",
            visibilityStatus: "not_recommended",
            text: "A filtered review with enough length to pass the composer's own client rule.",
          }),
        ],
      }),
    });

    render(
      <ReviewList
        businessSlug="test-cafe"
        initialReviews={[makeReview({ id: "r1" })]}
        notRecommendedCount={1}
        currentUserId={null}
      />,
    );

    const disclosureButton = screen.getByRole("button", {
      name: "1 review not currently recommended",
    });
    fireEvent.click(disclosureButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "A filtered review with enough length to pass the composer's own client rule.",
        ),
      ).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/businesses/test-cafe/reviews?includeFiltered=true",
    );
  });
});
