import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PhotoGallery } from "./photo-gallery";
import type { BusinessPhotoRow } from "@/lib/types/business";

function photo(overrides: Partial<BusinessPhotoRow> & { id: string }): BusinessPhotoRow {
  return {
    url: `https://picsum.photos/seed/${overrides.id}/800/600`,
    caption: null,
    sortOrder: 0,
    isMenuPhoto: false,
    ...overrides,
  };
}

describe("PhotoGallery", () => {
  it('renders the "No photos yet" empty state when given no photos', () => {
    render(<PhotoGallery photos={[]} primaryCategories={["cafe-bakery"]} />);

    expect(screen.getByText("No photos yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Photos for this business haven't been added yet. Check back soon.",
      ),
    ).toBeInTheDocument();
  });

  it("renders no Menu tab for a non-restaurant business, even with no isMenuPhoto photos", () => {
    const photos = [photo({ id: "p1" }), photo({ id: "p2" })];
    render(<PhotoGallery photos={photos} primaryCategories={["cafe-bakery"]} />);

    expect(screen.queryByRole("tab", { name: "Menu" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Photos" })).not.toBeInTheDocument();
  });

  it("renders a Menu tab for a restaurant with pinned menu photos, filtering correctly", () => {
    const photos = [
      photo({ id: "gallery-1", isMenuPhoto: false }),
      photo({ id: "menu-1", isMenuPhoto: true }),
      photo({ id: "menu-2", isMenuPhoto: true }),
    ];
    render(<PhotoGallery photos={photos} primaryCategories={["restaurant"]} />);

    const menuTab = screen.getByRole("tab", { name: "Menu" });
    expect(menuTab).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Photos" })).toBeInTheDocument();

    // "Photos" tab (default) shows only the non-menu photo.
    expect(screen.getAllByRole("img")).toHaveLength(1);

    // Radix Tabs switches the active tab on mousedown (not click).
    fireEvent.mouseDown(menuTab);

    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it('shows "Menu not available yet" when a restaurant has zero isMenuPhoto photos', () => {
    const photos = [photo({ id: "gallery-1", isMenuPhoto: false })];
    render(<PhotoGallery photos={photos} primaryCategories={["restaurant"]} />);

    const menuTab = screen.getByRole("tab", { name: "Menu" });
    fireEvent.mouseDown(menuTab);

    expect(screen.getByText("Menu not available yet")).toBeInTheDocument();
    expect(
      screen.getByText("This restaurant hasn't added menu photos yet."),
    ).toBeInTheDocument();
  });
});
