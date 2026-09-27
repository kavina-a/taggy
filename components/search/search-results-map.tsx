"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { DEFAULT_ICON } from "@/components/business/business-map";

export interface SearchResultsMapPin {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface SearchResultsMapProps {
  businesses: SearchResultsMapPin[];
}

// Colombo's approximate centroid — used only as a fallback when the current
// result set has zero pins (e.g. filtered down to nothing), so the map
// never renders at an undefined/NaN center.
const COLOMBO_FALLBACK_CENTER: [number, number] = [6.9271, 79.8612];

// Multi-pin variant of components/business/business-map.tsx — reuses the
// same react-leaflet + marker-icon-fix pattern rather than introducing a
// second map library or a second Leaflet wrapper (02-08-PLAN.md Task 3).
export function SearchResultsMap({ businesses }: SearchResultsMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = DEFAULT_ICON;
  }, []);

  const bounds = useMemo(() => {
    if (businesses.length === 0) return null;
    return L.latLngBounds(businesses.map((b) => [b.latitude, b.longitude]));
  }, [businesses]);

  return (
    <div data-testid="search-results-map" className="h-full w-full overflow-hidden rounded-md">
      <MapContainer
        center={bounds ? undefined : COLOMBO_FALLBACK_CENTER}
        bounds={bounds ?? undefined}
        boundsOptions={{ padding: [32, 32] }}
        zoom={bounds ? undefined : 12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businesses.map((business) => (
          <Marker
            key={business.slug}
            position={[business.latitude, business.longitude]}
            icon={DEFAULT_ICON}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              opacity={1}
              className="yelp-map-tooltip"
            >
              <span className="font-semibold text-xs text-neutral-900">{business.name}</span>
            </Tooltip>
            <Popup>
              <Link
                href={`/business/${business.slug}`}
                className="font-semibold text-sm hover:underline text-[#007692]"
              >
                {business.name}
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default SearchResultsMap;
