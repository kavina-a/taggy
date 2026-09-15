import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessCard, type BusinessCardProps } from "./business-card";

const baseProps: BusinessCardProps = {
  slug: "test-cafe",
  name: "Test Cafe",
  primaryCategory: "cafe-bakery",
  categoryLabel: "Cafes & Bakeries",
  district: "Colombo 07",
  photoUrl: null,
};

describe("BusinessCard", () => {
  it("renders exactly as before (no visual regression) when none of the new optional props are passed", () => {
    render(<BusinessCard {...baseProps} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Test Cafe" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cafes & Bakeries")).toBeInTheDocument();
    expect(screen.getByText("Colombo 07")).toBeInTheDocument();

    // None of Task 1's new search-context UI should appear when no new
    // optional props are passed — Phase 1's directory usage is unaffected.
    expect(screen.queryByText("No reviews yet")).not.toBeInTheDocument();
    expect(screen.queryByText(/^\$+$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Open now")).not.toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });

  it("renders a price tier badge when priceTier is passed", () => {
    render(<BusinessCard {...baseProps} priceTier={2} />);
    expect(screen.getByText("$$")).toBeInTheDocument();
  });

  it("renders all four price tier badges correctly", () => {
    const { rerender } = render(<BusinessCard {...baseProps} priceTier={1} />);
    expect(screen.getByText("$")).toBeInTheDocument();

    rerender(<BusinessCard {...baseProps} priceTier={3} />);
    expect(screen.getByText("$$$")).toBeInTheDocument();

    rerender(<BusinessCard {...baseProps} priceTier={4} />);
    expect(screen.getByText("$$$$")).toBeInTheDocument();
  });

  it("renders 'No reviews yet' and never a star row or numeric average when reviewCount is 0", () => {
    render(<BusinessCard {...baseProps} reviewCount={0} />);
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
    expect(screen.queryByTestId("star-rating")).not.toBeInTheDocument();
  });

  it("renders 'No reviews yet' when reviewCount is undefined but another search-context prop is present", () => {
    render(<BusinessCard {...baseProps} distanceKm={1.2} />);
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  it("renders formatted distance when distanceKm is passed", () => {
    render(<BusinessCard {...baseProps} distanceKm={1.2} />);
    expect(screen.getByText("1.2 km")).toBeInTheDocument();
  });

  it("renders a truncated one-line snippet when snippet is passed", () => {
    render(
      <BusinessCard
        {...baseProps}
        snippet="A cozy neighbourhood cafe serving coffee and pastries."
      />,
    );
    expect(
      screen.getByText("A cozy neighbourhood cafe serving coffee and pastries."),
    ).toBeInTheDocument();
  });

  it("renders a green 'Open now' badge when openNow is true", () => {
    render(<BusinessCard {...baseProps} openNow={true} />);
    const badge = screen.getByText("Open now");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("status-open");
  });

  it("renders a neutral-gray 'Closed' badge (never red) when openNow is false", () => {
    render(<BusinessCard {...baseProps} openNow={false} />);
    const badge = screen.getByText("Closed");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("status-closed");
    expect(badge.className).not.toContain("bg-destructive");
  });

  it("renders no open/closed badge when openNow is undefined", () => {
    render(<BusinessCard {...baseProps} priceTier={1} />);
    expect(screen.queryByText("Open now")).not.toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });
});
