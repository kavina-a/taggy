// Static district -> centroid lookup table (D-10: typed district-name lookup,
// no new geocoding dependency). Covers exactly the 12 seeded district
// strings (prisma/seed-data/businesses.json). Approximate real-world
// lat/lng centroids — Colombo's small area makes Euclidean-on-degrees
// distance (rather than haversine) an acceptable simplification at this
// scale (02-02-PLAN.md Task 1 action).
export interface DistrictCentroid {
  district: string;
  label: string;
  lat: number;
  lng: number;
}

export const districtCentroids: DistrictCentroid[] = [
  { district: "Colombo 01", label: "Colombo 01 (Fort)", lat: 6.9344, lng: 79.8428 },
  { district: "Colombo 02", label: "Colombo 02 (Slave Island)", lat: 6.9271, lng: 79.8449 },
  { district: "Colombo 03", label: "Colombo 03 (Kollupitiya)", lat: 6.9147, lng: 79.8489 },
  { district: "Colombo 04", label: "Colombo 04 (Bambalapitiya)", lat: 6.8905, lng: 79.857 },
  { district: "Colombo 05", label: "Colombo 05 (Havelock Town)", lat: 6.8794, lng: 79.8654 },
  { district: "Colombo 06", label: "Colombo 06 (Wellawatte)", lat: 6.8721, lng: 79.8621 },
  { district: "Colombo 07", label: "Colombo 07 (Cinnamon Gardens)", lat: 6.9059, lng: 79.8636 },
  { district: "Colombo 08", label: "Colombo 08 (Borella)", lat: 6.9147, lng: 79.8779 },
  { district: "Colombo 09", label: "Colombo 09 (Dematagoda)", lat: 6.9366, lng: 79.8778 },
  { district: "Colombo 10", label: "Colombo 10 (Maradana)", lat: 6.9296, lng: 79.8636 },
  { district: "Dehiwala", label: "Dehiwala", lat: 6.8567, lng: 79.8653 },
  { district: "Nugegoda", label: "Nugegoda", lat: 6.8686, lng: 79.8899 },
];

function euclideanDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat1 - lat2;
  const dLng = lng1 - lng2;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Straight-line (Euclidean-on-degrees) nearest match — acceptable at
// Colombo's scale per this file's header comment.
export function findNearestDistrict(lat: number, lng: number): DistrictCentroid {
  let nearest = districtCentroids[0];
  let nearestDistance = Infinity;

  for (const centroid of districtCentroids) {
    const distance = euclideanDistance(lat, lng, centroid.lat, centroid.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = centroid;
    }
  }

  return nearest;
}

// Case-insensitive exact match against `district`/`label` first, falling
// back to a substring match (e.g. "colombo 3" would not match "Colombo 03"
// exactly, but a caller passing the exact seeded string always resolves).
export function lookupDistrictCentroid(query: string): DistrictCentroid | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const exact = districtCentroids.find(
    (c) => c.district.toLowerCase() === normalized || c.label.toLowerCase() === normalized,
  );
  if (exact) return exact;

  const partial = districtCentroids.find(
    (c) =>
      c.district.toLowerCase().includes(normalized) || c.label.toLowerCase().includes(normalized),
  );
  return partial ?? null;
}

export const DEFAULT_COLOMBO_COORDS = { lat: 6.9271, lng: 79.8612 };

export function resolveLocationQuery(query: string): { lat: number; lng: number } | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  if (
    normalized === "near you" ||
    normalized === "near me" ||
    normalized === "current location" ||
    normalized === "colombo" ||
    normalized === "colombo, sri lanka"
  ) {
    return DEFAULT_COLOMBO_COORDS;
  }

  const district = lookupDistrictCentroid(query);
  if (district) {
    return { lat: district.lat, lng: district.lng };
  }

  return null;
}
