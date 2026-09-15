import { getCategoryLabel } from "@/lib/categories/category-config";
import type { BusinessCardProps } from "@/components/directory/business-card";

// JSON-safe shape of a single search result business — identical whether it
// arrives via the initial SSR render (app/search/page.tsx, passed as a
// Server->Client Component prop) or a live client-side fetch to
// GET /api/search (components/search/use-search-filter-state.ts). Kept
// deliberately permissive (no Prisma Date types) since fetch()'s
// `res.json()` always returns ISO date strings, never Date instances.
export interface SearchResultBusinessJson {
  id: string;
  slug: string;
  name: string;
  primaryCategories: string[];
  district: string;
  latitude: number;
  longitude: number;
  photos: { url: string }[];
  attributes: Record<string, unknown> | null;
  description: string | null;
  distanceKm: number | null;
  openNow?: boolean;
}

export interface SearchResultJson {
  businesses: SearchResultBusinessJson[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export function extractPriceTier(
  attributes: Record<string, unknown> | null | undefined,
): 1 | 2 | 3 | 4 | undefined {
  const raw = attributes?.priceTier;
  return typeof raw === "number" && raw >= 1 && raw <= 4 ? (raw as 1 | 2 | 3 | 4) : undefined;
}

// Single shared mapping from a search result row to BusinessCard's props —
// used by both the SSR initial render and every subsequent live-filtered
// fetch, so the card never renders differently depending on which path
// produced the data (02-RESEARCH.md's "no duplicated logic" convention
// extended from the ranking query to this presentation mapping).
export function mapBusinessToCardProps(business: SearchResultBusinessJson): BusinessCardProps {
  const primarySlug = business.primaryCategories[0] ?? "";
  return {
    slug: business.slug,
    name: business.name,
    primaryCategory: primarySlug,
    categoryLabel: getCategoryLabel(primarySlug) ?? primarySlug,
    district: business.district,
    photoUrl: business.photos[0]?.url ?? null,
    priceTier: extractPriceTier(business.attributes),
    distanceKm: business.distanceKm ?? undefined,
    snippet: business.description ?? undefined,
    openNow: business.openNow,
  };
}
