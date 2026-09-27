"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";

// Leaflet's default marker icon references relative image paths that break
// under most bundlers (webpack/Turbopack rewrite the URLs) — point them at
// the CDN copies that ship alongside the installed leaflet version instead
// of the broken relative defaults. Must happen once per client render.
// Exported so components/search/search-results-map.tsx (multi-pin search
// results map) can reuse the identical marker-icon fix rather than
// duplicating this CDN-URL workaround a second time.
export const DEFAULT_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface BusinessMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export function BusinessMap({ latitude, longitude, name }: BusinessMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = DEFAULT_ICON;
  }, []);

  return (
    <div
      data-testid="business-map"
      className="h-64 w-full overflow-hidden rounded-md md:h-80"
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={DEFAULT_ICON}>
          <Tooltip
            direction="top"
            offset={[0, -8]}
            opacity={1}
            className="yelp-map-tooltip"
          >
            <span className="font-semibold text-xs text-neutral-900">{name}</span>
          </Tooltip>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default BusinessMap;
