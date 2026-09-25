import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

import { ReviewCard } from "./review-card";
import type { ReviewListItem } from "@/lib/types/review";

function makeReview(overrides: Partial<ReviewListItem> = {}): ReviewListItem {
  return {
    id: "rev_1",
    userId: "user_1",
    userName: "Nimal Perera",
    userAccountCreatedAt: "2025-01-01T00:00:00.000Z",
    userReviewCount: 3,
    rating: 4,
    text: "Great food and friendly staff, would definitely come back again soon.",
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

describe("ReviewCard", () => {
  it("renders the reviewer name, rating, and text", () => {
    render(<ReviewCard review={makeReview()} isOwnReview={false} currentUserId={null} />);

    expect(screen.getByText("Nimal Perera")).toBeInTheDocument();
    expect(screen.getByLabelText("Rating: 4 out of 5")).toBeInTheDocument();
    expect(
      screen.getByText("Great food and friendly staff, would definitely come back again soon."),
    ).toBeInTheDocument();
  });

  it("falls back to Anonymous when the reviewer has no name set", () => {
    render(<ReviewCard review={makeReview({ userName: null })} isOwnReview={false} currentUserId={null} />);

    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });

  it("renders photos when present", () => {
    render(
      <ReviewCard
        review={makeReview({
          photos: [{ id: "p1", url: "https://example.com/photo.jpg", caption: null }],
        })}
        isOwnReview={false}
        currentUserId={null}
      />,
    );

    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("shows an Edit affordance only when this is the current user's own review", () => {
    const { rerender } = render(
      <ReviewCard review={makeReview()} isOwnReview={false} currentUserId={null} />,
    );
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();

    rerender(<ReviewCard review={makeReview()} isOwnReview={true} currentUserId="user_1" />);
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "#write-a-review",
    );
  });
});
