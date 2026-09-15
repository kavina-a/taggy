import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ReviewComposer (rendered for a logged-in currentUserId) calls useRouter()
// for router.refresh() after submit — not exercised by these tests, but the
// hook must resolve to something under jsdom's non-app-router test render.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { BusinessPageView } from "./business-page";
import { getCategoryLabel } from "@/lib/categories/category-config";
import type { BusinessDetail } from "@/lib/types/business";

const mockBusiness: BusinessDetail = {
  id: "biz_1",
  slug: "test-cafe",
  name: "Test Cafe",
  description: "A cozy neighbourhood cafe serving coffee and pastries.",
  primaryCategories: ["cafe-bakery", "retail-shopping"],
  secondaryCategories: ["beauty-spa", "grocery-convenience"],
  district: "Colombo 07",
  addressFreeText: "123 Test Road, Cinnamon Gardens",
  latitude: 6.9061,
  longitude: 79.8621,
  attributes: { wifi: true, outdoorSeating: true, takeout: true, delivery: false, priceTier: 2 },
  hours: [],
  hoursOverrides: [],
  photos: [],
};

describe("BusinessPageView", () => {
  it("renders name, categories, description, and district + address", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Test Cafe" }),
    ).toBeInTheDocument();

    for (const category of mockBusiness.primaryCategories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }

    expect(screen.getByText(mockBusiness.description)).toBeInTheDocument();

    expect(
      screen.getByText((_, element) => {
        return (
          element?.textContent ===
          `${mockBusiness.district} · ${mockBusiness.addressFreeText}`
        );
      }),
    ).toBeInTheDocument();
  });

  it("renders secondary categories as a distinct badge group", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    for (const category of mockBusiness.secondaryCategories) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }

    expect(screen.getAllByTestId("secondary-category-badge")).toHaveLength(
      mockBusiness.secondaryCategories.length,
    );
  });

  it("renders no Open now/Closed badge when openNow is null", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    expect(screen.queryByText("Open now")).not.toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });

  it("renders a business-map container regardless of network access", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    expect(screen.getByTestId("business-map")).toBeInTheDocument();
  });

  it('shows "Open now" when openNow is true', () => {
    render(<BusinessPageView business={mockBusiness} openNow={true} />);

    expect(screen.getByText("Open now")).toBeInTheDocument();
  });

  it('shows "Closed" when openNow is false', () => {
    render(<BusinessPageView business={mockBusiness} openNow={false} />);

    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("renders at least one attribute badge for a business with valid attributes", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    expect(screen.getAllByTestId("attribute-badge").length).toBeGreaterThan(0);
  });

  it("renders a Directory > Category > Business Name breadcrumb", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    const categoryLabel = getCategoryLabel(mockBusiness.primaryCategories[0]);

    expect(breadcrumb.textContent).toContain("Directory");
    expect(breadcrumb.textContent).toContain(categoryLabel);
    expect(breadcrumb.textContent).toContain(mockBusiness.name);
  });

  it("renders the photo gallery section", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Photos" }),
    ).toBeInTheDocument();
    // No photos in the mock -> gallery renders its empty state.
    expect(screen.getByText("No photos yet")).toBeInTheDocument();
  });

  it("shows a guest login prompt instead of the composer when currentUserId is null", () => {
    render(<BusinessPageView business={mockBusiness} openNow={null} />);

    expect(screen.getByRole("link", { name: /Log in to write a review/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByRole("button", { name: "Submit review" })).not.toBeInTheDocument();
  });

  it("shows the review composer directly for a logged-in user with no existing review", () => {
    render(
      <BusinessPageView business={mockBusiness} openNow={null} currentUserId="user_1" />,
    );

    expect(screen.getByRole("button", { name: "Submit review" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Your rating" })).toBeInTheDocument();
  });

  it("renders the Reviews section heading and passed-in reviews", () => {
    render(
      <BusinessPageView
        business={mockBusiness}
        openNow={null}
        reviews={[
          {
            id: "rev_1",
            userId: "user_2",
            userName: "Kamal",
            userAccountCreatedAt: "2025-01-01T00:00:00.000Z",
            userReviewCount: 2,
            rating: 5,
            text: "Excellent coffee and a lovely quiet corner to work from in the mornings.",
            visitDate: null,
            visibilityStatus: "recommended",
            editedAt: null,
            createdAt: "2026-09-01T00:00:00.000Z",
            photos: [],
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByText("Kamal")).toBeInTheDocument();
  });
});
