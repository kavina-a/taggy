import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuestionList } from "./question-list";
import type { QuestionListItem } from "@/lib/types/qa";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const question: QuestionListItem = {
  id: "q1",
  userId: "u1",
  userName: "Amina",
  text: "Do they take walk-ins on Sundays?",
  createdAt: "2026-01-01T00:00:00.000Z",
  answers: [
    {
      id: "a1",
      userId: "u2",
      userName: "Owner Sam",
      text: "Yes, until 2pm — later is reservation only.",
      voteCount: 3,
      createdAt: "2026-01-01T01:00:00.000Z",
      isOwner: true,
      viewerVoted: false,
    },
  ],
};

describe("QuestionList", () => {
  it("sends guests to login to ask", () => {
    render(<QuestionList businessSlug="test-cafe" questions={[]} currentUserId={null} />);
    expect(screen.getByRole("link", { name: "Log in to ask a question" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByText("No questions yet. Be the first to ask.")).toBeInTheDocument();
  });

  it("renders answers with an Owner label and the top-voted text", () => {
    render(
      <QuestionList businessSlug="test-cafe" questions={[question]} currentUserId="viewer" />,
    );
    expect(screen.getByText("Do they take walk-ins on Sundays?")).toBeInTheDocument();
    expect(screen.getByText(/Owner Sam/)).toBeInTheDocument();
    expect(screen.getByText(/Owner/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Useful 3/ })).toBeInTheDocument();
  });
});
