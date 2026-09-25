import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhotoUploadForm } from "./photo-upload-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("PhotoUploadForm", () => {
  it("sends guests to login instead of showing the file input", () => {
    render(<PhotoUploadForm businessSlug="test-cafe" currentUserId={null} />);
    expect(screen.getByRole("link", { name: "Log in to add a photo" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByLabelText("Add a photo")).not.toBeInTheDocument();
  });

  it("shows the file input for a logged-in user", () => {
    render(<PhotoUploadForm businessSlug="test-cafe" currentUserId="user_1" />);
    expect(screen.getByLabelText("Add a photo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload photo" })).toBeInTheDocument();
  });
});
