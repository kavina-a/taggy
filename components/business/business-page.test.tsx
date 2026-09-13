import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessPageView } from "./business-page";
import type { BusinessDetail } from "@/lib/types/business";

const mockBusiness: BusinessDetail = {
  id: "biz_1",
  slug: "test-cafe",
  name: "Test Cafe",
  description: "A cozy neighbourhood cafe serving coffee and pastries.",
  primaryCategories: ["cafe", "restaurant"],
  secondaryCategories: [],
  district: "Colombo 07",
  addressFreeText: "123 Test Road, Cinnamon Gardens",
  latitude: 6.9061,
  longitude: 79.8621,
  attributes: {},
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
});
