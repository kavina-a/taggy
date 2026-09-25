import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaveBusinessButton } from "./save-business-button";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("SaveBusinessButton", () => {
  it("sends guests to login", () => {
    render(
      <SaveBusinessButton businessId="biz_1" currentUserId={null} memberships={[]} />,
    );
    expect(screen.getByRole("link", { name: /Save/ })).toHaveAttribute("href", "/login");
  });

  it("shows Saved when the business is already in a list", () => {
    render(
      <SaveBusinessButton
        businessId="biz_1"
        currentUserId="user_1"
        memberships={[{ id: "c1", name: "My Saved Places", containsBusiness: true }]}
      />,
    );
    expect(screen.getByRole("button", { name: /Saved/ })).toBeInTheDocument();
  });
});
