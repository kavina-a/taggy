import { createHash } from "node:crypto";
import { getCategoryLabel } from "@/lib/categories/category-config";
import { computeOpenNow } from "@/lib/hours/compute-open-now";
import { prisma } from "@/lib/prisma";
import type { DiscoveryRailBusiness } from "@/components/home/discovery-rail";
import type { BusinessHoursOverrideRow, BusinessHoursRow } from "@/lib/types/business";

export const RAIL_SIZE = 10;
export const RELATED_SIZE = 6;

export interface BusinessRailRow {
  id: string;
  slug: string;
  name: string;
  primaryCategories: string[];
  district: string;
  attributes: unknown;
  avgRating?: number | null;
  reviewCount?: number;
  photos: { url: string }[];
}

function extractPriceTier(attributes: Record<string, unknown>): 1 | 2 | 3 | 4 | undefined {
  const raw = attributes.priceTier;
  return typeof raw === "number" && raw >= 1 && raw <= 4 ? (raw as 1 | 2 | 3 | 4) : undefined;
}

export function toRailBusiness(
  business: BusinessRailRow,
  openNow: boolean | undefined,
): DiscoveryRailBusiness {
  const primarySlug = business.primaryCategories[0] ?? "";
  const categoryLabel = getCategoryLabel(primarySlug) ?? primarySlug;
  const attributes = (business.attributes ?? {}) as Record<string, unknown>;

  return {
    slug: business.slug,
    name: business.name,
    primaryCategory: primarySlug,
    categoryLabel,
    district: business.district,
    photoUrl: business.photos[0]?.url ?? null,
    priceTier: extractPriceTier(attributes),
    openNow,
    avgRating: business.avgRating ?? null,
    reviewCount: business.reviewCount,
  };
}

export async function computeOpenNowByBusinessId(ids: string[]): Promise<Map<string, boolean>> {
  if (ids.length === 0) return new Map();

  const rows = await prisma.business.findMany({
    where: { id: { in: ids } },
    select: { id: true, hours: true, hoursOverrides: true },
  });

  const result = new Map<string, boolean>();
  for (const row of rows) {
    const hours: BusinessHoursRow[] = row.hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      crossesMidnight: h.crossesMidnight,
    }));
    const overrides: BusinessHoursOverrideRow[] = row.hoursOverrides.map((o) => ({
      date: o.date.toISOString().slice(0, 10),
      isClosed: o.isClosed,
      openTime: o.openTime,
      closeTime: o.closeTime,
      crossesMidnight: o.crossesMidnight,
    }));
    result.set(row.id, computeOpenNow(hours, overrides));
  }
  return result;
}

const railSelect = {
  id: true,
  slug: true,
  name: true,
  primaryCategories: true,
  district: true,
  attributes: true,
  avgRating: true,
  reviewCount: true,
  photos: { take: 1, select: { url: true } },
} as const;

export async function loadTopRatedBusinesses(): Promise<DiscoveryRailBusiness[]> {
  const rows = await prisma.business.findMany({
    where: { isTest: false, avgRating: { not: null }, reviewCount: { gt: 0 } },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: RAIL_SIZE,
    select: railSelect,
  });
  const openNowById = await computeOpenNowByBusinessId(rows.map((b) => b.id));
  return rows.map((b) => toRailBusiness(b, openNowById.get(b.id)));
}

export async function loadRelatedBusinesses(
  businessId: string,
  primaryCategory: string | undefined,
): Promise<DiscoveryRailBusiness[]> {
  if (!primaryCategory) return [];
  const rows = await prisma.business.findMany({
    where: {
      id: { not: businessId },
      primaryCategories: { has: primaryCategory },
      isTest: false,
    },
    take: RELATED_SIZE,
    select: railSelect,
  });
  return rows.map((b) => toRailBusiness(b, undefined));
}

function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Extracted from app/page.tsx (DATA-03) — the home page's "Trending Near
// You" rail samples a stable, deterministic subset of ids (identical across
// requests/dev-restarts) via a SHA-256 hash of businessId+"trending-v1"
// (02-RESEARCH.md/PROJECT.md decision log). isTest:false is applied to the
// candidate-id query itself, before scoring/sorting, so a test fixture can
// never hash-sort into the returned set.
export async function getTrendingBusinessIds(limit: number): Promise<string[]> {
  const all = await prisma.business.findMany({
    where: { isTest: false },
    select: { id: true },
  });
  const scored = all
    .map((b) => ({ id: b.id, hash: stableHash(`${b.id}trending-v1`) }))
    .sort((a, b) => (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0));
  return scored.slice(0, limit).map((s) => s.id);
}

// Extracted from app/page.tsx (DATA-03) — hydrates a set of ids (e.g. the
// trending id list above) into full rail rows, in one batched findMany.
export async function loadBusinessesByIds(ids: string[]): Promise<BusinessRailRow[]> {
  return prisma.business.findMany({
    where: { id: { in: ids }, isTest: false },
    select: railSelect,
  });
}

// Extracted from app/page.tsx (DATA-03) — the home page's "New Businesses"
// rail, most-recently-created first.
export async function loadNewBusinesses(limit: number): Promise<BusinessRailRow[]> {
  return prisma.business.findMany({
    where: { isTest: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: railSelect,
  });
}
