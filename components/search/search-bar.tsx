"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Crosshair,
  Navigation,
  Loader2,
  X,
  UtensilsCrossed,
  Coffee,
  Wrench,
  Car,
  Fish,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  findNearestDistrict,
  lookupDistrictCentroid,
  DEFAULT_COLOMBO_COORDS,
} from "@/lib/search/district-centroids";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  initialFindDesc?: string;
  initialFindLoc?: string;
  variant?: "default" | "unified" | "header";
  className?: string;
}

// D-10: never block rendering/submit on a geolocation prompt — this is a
// best-effort background attempt with a short timeout, silently falling
// back (no error UI) if denied/unavailable/timed out.
const GEOLOCATION_TIMEOUT_MS = 5000;

interface Coordinates {
  lat: number;
  lng: number;
}

const POPULAR_SEARCH_SUGGESTIONS = [
  { icon: UtensilsCrossed, label: "Restaurants & Dining", query: "Restaurants" },
  { icon: Coffee, label: "Cafes & Bakeries", query: "Cafes" },
  { icon: Wrench, label: "Plumbers & Home Care", query: "Plumber" },
  { icon: Car, label: "Auto Repair & Tuk Tuk", query: "Auto Repair" },
  { icon: Fish, label: "Seafood Dining", query: "Seafood" },
];

const POPULAR_NEIGHBORHOODS = [
  { district: "Colombo 01", label: "Colombo 01 (Fort)", lat: 6.9344, lng: 79.8428 },
  { district: "Colombo 02", label: "Colombo 02 (Slave Island)", lat: 6.9271, lng: 79.8449 },
  { district: "Colombo 03", label: "Colombo 03 (Kollupitiya)", lat: 6.9147, lng: 79.8489 },
  { district: "Colombo 04", label: "Colombo 04 (Bambalapitiya)", lat: 6.8905, lng: 79.857 },
  { district: "Colombo 07", label: "Colombo 07 (Cinnamon Gardens)", lat: 6.9059, lng: 79.8636 },
  { district: "Dehiwala", label: "Dehiwala", lat: 6.8567, lng: 79.8653 },
  { district: "Nugegoda", label: "Nugegoda", lat: 6.8686, lng: 79.8899 },
];

export function SearchBar({
  initialFindDesc,
  initialFindLoc,
  variant = "unified",
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [findDesc, setFindDesc] = useState(initialFindDesc ?? "");
  const [findLoc, setFindLoc] = useState(initialFindLoc ?? "");
  const [wherePlaceholder, setWherePlaceholder] = useState("Near you");
  const [geoCoords, setGeoCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [whatFocused, setWhatFocused] = useState(false);
  const [whereFocused, setWhereFocused] = useState(false);

  const containerRef = useRef<HTMLFormElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setWhatFocused(false);
        setWhereFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Background geolocation attempt
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGeoCoords({ lat, lng });
        const nearest = findNearestDistrict(lat, lng);
        setWherePlaceholder(nearest.label);
      },
      () => {
        // Denied/unavailable/timed out — silently keep the static
        // "Near you" placeholder, never block the search bar on this.
      },
      { timeout: GEOLOCATION_TIMEOUT_MS },
    );
  }, []);

  // Interactive 1-click "Near you" / Current Location detection
  function handleCurrentLocationClick() {
    setIsLocating(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGeoCoords({ lat, lng });
          const nearest = findNearestDistrict(lat, lng);
          setFindLoc("Current Location");
          setWherePlaceholder(nearest.label);
          setIsLocating(false);
          setWhereFocused(false);
        },
        () => {
          // If denied or timed out, use Colombo default coordinates
          setGeoCoords(DEFAULT_COLOMBO_COORDS);
          setFindLoc("Colombo");
          setWherePlaceholder("Colombo");
          setIsLocating(false);
          setWhereFocused(false);
        },
        { timeout: 8000, enableHighAccuracy: true },
      );
    } else {
      setGeoCoords(DEFAULT_COLOMBO_COORDS);
      setFindLoc("Colombo");
      setIsLocating(false);
      setWhereFocused(false);
    }
  }

  function handleSelectNeighborhood(neighborhood: (typeof POPULAR_NEIGHBORHOODS)[0]) {
    setFindLoc(neighborhood.label);
    setGeoCoords({ lat: neighborhood.lat, lng: neighborhood.lng });
    setWhereFocused(false);
  }

  function handleSelectSuggestion(suggestion: (typeof POPULAR_SEARCH_SUGGESTIONS)[0]) {
    setFindDesc(suggestion.query);
    setWhatFocused(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWhatFocused(false);
    setWhereFocused(false);

    const params = new URLSearchParams();
    const trimmedDesc = findDesc.trim();
    const trimmedLoc = findLoc.trim();

    if (trimmedDesc) params.set("find_desc", trimmedDesc);

    let coords = geoCoords;
    const isNearQuery =
      trimmedLoc.toLowerCase() === "near you" ||
      trimmedLoc.toLowerCase() === "near me" ||
      trimmedLoc.toLowerCase() === "current location";

    if (isNearQuery) {
      params.set("find_loc", "Near you");
      if (!coords) {
        coords = DEFAULT_COLOMBO_COORDS;
      }
    } else if (trimmedLoc) {
      params.set("find_loc", trimmedLoc);
      if (!coords) {
        const matchedDistrict = lookupDistrictCentroid(trimmedLoc);
        if (matchedDistrict) {
          coords = { lat: matchedDistrict.lat, lng: matchedDistrict.lng };
        }
      }
    }

    if (coords) {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
    }

    router.push(`/search?${params.toString()}`);
  }

  // Unified Yelp-style connected search box
  if (variant === "unified" || variant === "header") {
    const isHeader = variant === "header";

    return (
      <form
        ref={containerRef}
        onSubmit={handleSubmit}
        className={cn(
          "relative flex w-full items-center rounded-md border border-[#C8C9CA] bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#D71616]/30 focus-within:border-[#D71616]",
          isHeader ? "h-10 max-w-xl" : "h-12 sm:h-14",
          className,
        )}
      >
        {/* "What" input */}
        <div className="relative flex flex-1 items-center px-3 min-w-0">
          <Search className="size-4 shrink-0 text-neutral-400" />
          <Input
            aria-label="What are you looking for?"
            placeholder={isHeader ? "tacos, cheap dinner, max's..." : "things to do, kottu, plumbers..."}
            value={findDesc}
            onFocus={() => {
              setWhatFocused(true);
              setWhereFocused(false);
            }}
            onChange={(event) => setFindDesc(event.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm sm:text-base font-normal placeholder:text-neutral-400 pl-2 pr-6 h-full"
          />
          {findDesc && (
            <button
              type="button"
              onClick={() => setFindDesc("")}
              className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
              aria-label="Clear search input"
            >
              <X className="size-3.5" />
            </button>
          )}

          {/* "What" Popular Suggestions Dropdown */}
          {whatFocused && (
            <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Popular Categories
              </div>
              <div className="flex flex-col mt-1">
                {POPULAR_SEARCH_SUGGESTIONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(item);
                      }}
                      className="flex items-center gap-3 px-3.5 py-2 text-left hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 group-hover:bg-[#D71616]/10 group-hover:text-[#D71616] transition-colors">
                        <Icon className="size-3.5" />
                      </div>
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-[#D71616]">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-neutral-200 shrink-0" aria-hidden="true" />

        {/* "Where" input with Near you & GPS trigger */}
        <div className="relative flex flex-1 items-center px-3 min-w-0">
          <MapPin className="size-4 shrink-0 text-neutral-400" />
          <Input
            aria-label="Where"
            placeholder={wherePlaceholder}
            value={findLoc}
            onFocus={() => {
              setWhereFocused(true);
              setWhatFocused(false);
            }}
            onChange={(event) => setFindLoc(event.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm sm:text-base font-normal placeholder:text-neutral-400 pl-2 pr-14 h-full"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {findLoc && (
              <button
                type="button"
                onClick={() => setFindLoc("")}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
                aria-label="Clear location input"
              >
                <X className="size-3.5" />
              </button>
            )}

            {/* Quick 1-click GPS button */}
            <button
              type="button"
              onClick={handleCurrentLocationClick}
              title="Use current location (Near you)"
              aria-label="Use Current Location (Near you)"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:text-[#D71616] hover:bg-neutral-100 transition-colors"
            >
              {isLocating ? (
                <Loader2 className="size-3.5 animate-spin text-[#D71616]" />
              ) : (
                <Crosshair className="size-3.5" />
              )}
            </button>
          </div>

          {/* "Where" Near You & Neighborhoods Dropdown */}
          {whereFocused && (
            <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-1.5 w-full sm:w-84 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Primary Action: Current Location (Near you) */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCurrentLocationClick();
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-neutral-50 text-left transition-colors group"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#D71616] group-hover:bg-red-100 transition-colors">
                  {isLocating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Navigation className="size-4 fill-[#D71616]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                    Current Location
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      Near you
                    </span>
                  </span>
                  <span className="text-xs text-neutral-500">
                    {isLocating
                      ? "Detecting your GPS position..."
                      : "Search businesses near your current position"}
                  </span>
                </div>
              </button>

              <div className="my-1.5 border-t border-neutral-100" />

              <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Popular Neighborhoods
              </div>
              <div className="flex flex-col mt-0.5 max-h-48 overflow-y-auto">
                {POPULAR_NEIGHBORHOODS.map((item) => (
                  <button
                    key={item.district}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectNeighborhood(item);
                    }}
                    className="flex items-center gap-2.5 px-4 py-1.5 text-left hover:bg-neutral-50 transition-colors group"
                  >
                    <MapPin className="size-3.5 text-neutral-400 group-hover:text-[#D71616] shrink-0" />
                    <span className="text-sm text-neutral-700 group-hover:text-neutral-900 font-medium">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Red Yelp Search Button */}
        <Button
          type="submit"
          className={cn(
            "bg-[#D71616] hover:bg-[#B80F0F] text-white shrink-0 font-semibold transition-colors flex items-center justify-center gap-1.5",
            isHeader
              ? "h-10 px-4 rounded-r-md rounded-l-none"
              : "h-full px-5 sm:px-7 rounded-r-md rounded-l-none text-base",
          )}
        >
          <Search className="size-4 text-white" />
          <span className={cn(isHeader && "hidden sm:inline")}>Search</span>
        </Button>
      </form>
    );
  }

  // Classic fallback layout
  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2 sm:flex-row sm:items-end", className)}
    >
      <div className="flex flex-1 flex-col gap-1">
        <Input
          aria-label="What are you looking for?"
          placeholder="What are you looking for?"
          value={findDesc}
          onChange={(event) => setFindDesc(event.target.value)}
        />
      </div>
      <div className="relative flex flex-1 flex-col gap-1">
        <Input
          aria-label="Where"
          placeholder={wherePlaceholder}
          value={findLoc}
          onChange={(event) => setFindLoc(event.target.value)}
        />
        <button
          type="button"
          onClick={handleCurrentLocationClick}
          title="Use current location (Near you)"
          aria-label="Use Current Location (Near you)"
          className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-[#D71616]"
        >
          {isLocating ? <Loader2 className="size-4 animate-spin text-[#D71616]" /> : <Crosshair className="size-4" />}
        </button>
      </div>
      <Button
        type="submit"
        className="min-h-11 w-fit bg-[#D71616] hover:bg-[#B80F0F] text-white"
      >
        Search
      </Button>
    </form>
  );
}

export default SearchBar;

