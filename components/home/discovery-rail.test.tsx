import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiscoveryRail, type DiscoveryRailBusiness } from "./discovery-rail";

const cafe: DiscoveryRailBusiness = {
  slug: "test-cafe",
  name: "Test Cafe",
  primaryCategory: "cafe-bakery",
  categoryLabel: "Cafes & Bakeries",
  district: "Colombo 07",
  photoUrl: null,
  priceTier: 2,
  openNow: true,
};

const restaurant: DiscoveryRailBusiness = {
  slug: "test-restaurant",
  name: "Test Restaurant",
  primaryCategory: "restaurant",
  categoryLabel: "Restaurants",
  district: "Colombo 03",
  photoUrl: null,
  distanceKm: 2.5,
};

describe("DiscoveryRail", () => {
  it("renders nothing at all when businesses is empty", () => {
    const { container } = render(
      <DiscoveryRail heading="Trending Near You" businesses={[]} />,
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("Trending Near You")).not.toBeInTheDocument();
  });

  it("renders a heading and a horizontally-scrollable row of condensed cards for a non-empty list", () => {
    const { container } = render(
      <DiscoveryRail heading="Trending Near You" businesses={[cafe, restaurant]} />,
    );

    expect(
      screen.getByRole("heading", { name: "Trending Near You" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Test Cafe")).toBeInTheDocument();
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();

    const row = container.querySelector(".overflow-x-auto");
    expect(row).not.toBeNull();
  });

  it("shows exactly one metadata line combining category label and price tier when priceTier is provided, and omits any snippet text", () => {
    render(<DiscoveryRail heading="Trending Near You" businesses={[cafe]} />);
    expect(screen.getByText("Cafes & Bakeries · $$")).toBeInTheDocument();
    expect(screen.queryByText("No reviews yet")).not.toBeInTheDocument();
  });

  it("shows rating in the metadata line when avgRating is provided", () => {
    render(
      <DiscoveryRail
        heading="Top Rated this month"
        businesses={[{ ...cafe, avgRating: 4.6, reviewCount: 12 }]}
      />,
    );
    expect(screen.getByText("Cafes & Bakeries · ★ 4.6 (12)")).toBeInTheDocument();
  });
});
