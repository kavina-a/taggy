"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  findNearestDistrict,
  lookupDistrictCentroid,
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmedDesc = findDesc.trim();
    const trimmedLoc = findLoc.trim();
    if (trimmedDesc) params.set("find_desc", trimmedDesc);
    if (trimmedLoc) params.set("find_loc", trimmedLoc);

    let coords = geoCoords;
    if (!coords && trimmedLoc) {
      const matchedDistrict = lookupDistrictCentroid(trimmedLoc);
      if (matchedDistrict) {
        coords = { lat: matchedDistrict.lat, lng: matchedDistrict.lng };
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
        onSubmit={handleSubmit}
        className={cn(
          "flex w-full items-center rounded-md border border-[#C8C9CA] bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#D71616]/30 focus-within:border-[#D71616]",
          isHeader ? "h-10 max-w-xl" : "h-12 sm:h-14",
          className,
        )}
      >
        {/* "What" input */}
        <div className="relative flex flex-1 items-center px-3">
          <Search className="size-4 shrink-0 text-neutral-400" />
          <Input
            aria-label="What are you looking for?"
            placeholder={isHeader ? "tacos, cheap dinner, max's..." : "things to do, kottu, plumbers..."}
            value={findDesc}
            onChange={(event) => setFindDesc(event.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm sm:text-base font-normal placeholder:text-neutral-400 pl-2 h-full"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-neutral-200 shrink-0" aria-hidden="true" />

        {/* "Where" input */}
        <div className="relative flex flex-1 items-center px-3">
          <MapPin className="size-4 shrink-0 text-neutral-400" />
          <Input
            aria-label="Where"
            placeholder={wherePlaceholder}
            value={findLoc}
            onChange={(event) => setFindLoc(event.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm sm:text-base font-normal placeholder:text-neutral-400 pl-2 h-full"
          />
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
      <div className="flex flex-1 flex-col gap-1">
        <Input
          aria-label="Where"
          placeholder={wherePlaceholder}
          value={findLoc}
          onChange={(event) => setFindLoc(event.target.value)}
        />
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
