import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const findNearestDistrictMock = vi.fn();
const lookupDistrictCentroidMock = vi.fn();

vi.mock("@/lib/search/district-centroids", () => ({
  findNearestDistrict: (...args: unknown[]) => findNearestDistrictMock(...args),
  lookupDistrictCentroid: (...args: unknown[]) => lookupDistrictCentroidMock(...args),
  DEFAULT_COLOMBO_COORDS: { lat: 6.9271, lng: 79.8612 },
}));

import { SearchBar } from "./search-bar";

function mockGeolocationSuccess(lat: number, lng: number) {
  Object.defineProperty(global.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success: PositionCallback) => {
        success({
          coords: { latitude: lat, longitude: lng },
        } as GeolocationPosition);
      },
    },
  });
}

function mockGeolocationFailure() {
  Object.defineProperty(global.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (
        _success: PositionCallback,
        error?: PositionErrorCallback,
      ) => {
        error?.({ code: 1, message: "denied" } as GeolocationPositionError);
      },
    },
  });
}

function mockGeolocationUnavailable() {
  Object.defineProperty(global.navigator, "geolocation", {
    configurable: true,
    value: undefined,
  });
}

describe("SearchBar", () => {
  beforeEach(() => {
    pushMock.mockReset();
    findNearestDistrictMock.mockReset();
    lookupDistrictCentroidMock.mockReset();
    lookupDistrictCentroidMock.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates to /search?find_desc=<value> with no lat/lng when only free text is entered", async () => {
    mockGeolocationFailure();
    render(<SearchBar />);

    fireEvent.change(screen.getByLabelText("What are you looking for?"), {
      target: { value: "kottu" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    const url = pushMock.mock.calls[0][0] as string;
    expect(url).toContain("/search?");
    expect(url).toContain("find_desc=kottu");
    expect(url).not.toContain("lat=");
    expect(url).not.toContain("lng=");
  });

  it("navigates including lat/lng from a successful geolocation read", async () => {
    mockGeolocationSuccess(6.9147, 79.8489);
    findNearestDistrictMock.mockReturnValue({
      district: "Colombo 03",
      label: "Colombo 03 (Kollupitiya)",
      lat: 6.9147,
      lng: 79.8489,
    });
    render(<SearchBar />);

    await waitFor(() => expect(findNearestDistrictMock).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("What are you looking for?"), {
      target: { value: "kottu" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    const url = pushMock.mock.calls[0][0] as string;
    expect(url).toContain("lat=6.9147");
    expect(url).toContain("lng=79.8489");
  });

  it("navigates including a matched district's lat/lng when geolocation is unavailable but 'where' text matches a known district", async () => {
    mockGeolocationUnavailable();
    lookupDistrictCentroidMock.mockImplementation((query: string) =>
      query === "colombo 3"
        ? { district: "Colombo 03", label: "Colombo 03 (Kollupitiya)", lat: 6.9147, lng: 79.8489 }
        : null,
    );
    render(<SearchBar />);

    fireEvent.change(screen.getByLabelText("Where"), {
      target: { value: "colombo 3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    const url = pushMock.mock.calls[0][0] as string;
    expect(url).toContain("lat=6.9147");
    expect(url).toContain("lng=79.8489");
  });

  it("shows a detected location label as the 'where' placeholder when geolocation succeeds", async () => {
    mockGeolocationSuccess(6.9147, 79.8489);
    findNearestDistrictMock.mockReturnValue({
      district: "Colombo 03",
      label: "Colombo 03",
      lat: 6.9147,
      lng: 79.8489,
    });
    render(<SearchBar />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Colombo 03")).toBeInTheDocument();
    });
  });

  it("falls back to the static 'Near you' placeholder when geolocation is denied/unavailable", async () => {
    mockGeolocationFailure();
    render(<SearchBar />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Near you")).toBeInTheDocument();
    });
    expect(findNearestDistrictMock).not.toHaveBeenCalled();
  });

  it("navigates with fallback coordinates when user searches 'Near you' without active GPS", async () => {
    mockGeolocationFailure();
    render(<SearchBar />);

    fireEvent.change(screen.getByLabelText("Where"), {
      target: { value: "Near you" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    const url = pushMock.mock.calls[0][0] as string;
    expect(url).toContain("find_loc=Near+you");
    expect(url).toContain("lat=6.9271");
    expect(url).toContain("lng=79.8612");
  });

  it("clicking the GPS button triggers geolocation and sets Current Location", async () => {
    mockGeolocationSuccess(6.9147, 79.8489);
    findNearestDistrictMock.mockReturnValue({
      district: "Colombo 03",
      label: "Colombo 03 (Kollupitiya)",
      lat: 6.9147,
      lng: 79.8489,
    });
    render(<SearchBar />);

    const gpsBtn = screen.getByLabelText("Use Current Location (Near you)");
    fireEvent.click(gpsBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Current Location")).toBeInTheDocument();
    });
  });
});

