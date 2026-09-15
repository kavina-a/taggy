"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  findNearestDistrict,
  lookupDistrictCentroid,
} from "@/lib/search/district-centroids";

export interface SearchBarProps {
  initialFindDesc?: string;
  initialFindLoc?: string;
}

// D-10: never block rendering/submit on a geolocation prompt — this is a
// best-effort background attempt with a short timeout, silently falling
// back (no error UI) if denied/unavailable/timed out.
const GEOLOCATION_TIMEOUT_MS = 5000;

interface Coordinates {
  lat: number;
  lng: number;
}

export function SearchBar({ initialFindDesc, initialFindLoc }: SearchBarProps) {
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
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
        className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
      >
        Search
      </Button>
    </form>
  );
}

export default SearchBar;
