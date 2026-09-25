import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VoteButtons } from "./vote-buttons";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("VoteButtons", () => {
  it("sends guests to login instead of toggling", () => {
    render(
      <VoteButtons
        reviewId="rev_1"
        usefulCount={2}
        funnyCount={0}
        coolCount={0}
        viewerVotes={[]}
        currentUserId={null}
        isOwnReview={false}
      />,
    );

    expect(screen.getByRole("link", { name: /Useful/ })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /Funny/ })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /Cool/ })).toHaveAttribute("href", "/login");
  });

  it("does not render vote controls on the author's own review", () => {
    render(
      <VoteButtons
        reviewId="rev_1"
        usefulCount={0}
        funnyCount={0}
        coolCount={0}
        viewerVotes={[]}
        currentUserId="user_1"
        isOwnReview={true}
      />,
    );

    expect(screen.queryByRole("button", { name: /Useful/ })).not.toBeInTheDocument();
  });
});
