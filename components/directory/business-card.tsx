import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export interface BusinessCardProps {
  slug: string;
  name: string;
  primaryCategory: string;
  categoryLabel: string;
  district: string;
  photoUrl: string | null;
  // Search-context props (all optional, additive per 02-UI-SPEC.md —
  // Phase 1's directory usage passes none of these and must keep rendering
  // unchanged). Only rendered when at least one of them is present.
  priceTier?: 1 | 2 | 3 | 4;
  reviewCount?: number;
  distanceKm?: number | null;
  snippet?: string;
  openNow?: boolean;
}

const PRICE_TIER_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

function formatDistanceKm(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

// Shared blur placeholder — same small neutral-gray base64 PNG used by
// PhotoGallery, so directory cards and business-page gallery tiles load
// consistently on slow 3G/4G connections (never a spinner-only state).
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function CardPhoto({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  if (!photoUrl) {
    // UI-SPEC's "image failed to load" fallback tile, reused here for the
    // "no photos at all" case — never a broken-image icon or blank box.
    return (
      <AspectRatio
        ratio={4 / 3}
        className="flex items-center justify-center overflow-hidden rounded-md bg-secondary"
      >
        <span className="text-sm leading-normal text-muted-foreground">
          Image unavailable
        </span>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md bg-secondary">
      <Image
        src={photoUrl}
        alt={`${name} photo`}
        fill
        loading="lazy"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
    </AspectRatio>
  );
}

export function BusinessCard({
  slug,
  name,
  primaryCategory,
  categoryLabel,
  district,
  photoUrl,
  priceTier,
  reviewCount,
  distanceKm,
  snippet,
  openNow,
}: BusinessCardProps) {
  // Whether ANY search-context prop was passed — gates the whole extra
  // metadata block so Phase 1's directory call site (which passes none of
  // these) renders identically to before (Task 1 behavior contract).
  const hasSearchContext =
    priceTier !== undefined ||
    reviewCount !== undefined ||
    distanceKm !== undefined ||
    snippet !== undefined ||
    openNow !== undefined;

  return (
    <Link
      href={`/business/${slug}`}
      data-primary-category={primaryCategory}
      className="block min-h-11 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors hover:bg-secondary/60">
        <CardContent className="flex flex-col gap-2">
          <CardPhoto photoUrl={photoUrl} name={name} />
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl leading-[1.2] font-semibold">{name}</h3>
            {openNow !== undefined && (
              <Badge
                className={
                  openNow
                    ? "shrink-0 bg-status-open text-white"
                    : "shrink-0 bg-status-closed text-white"
                }
              >
                {openNow ? "Open now" : "Closed"}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="w-fit">
              {categoryLabel}
            </Badge>
            {priceTier !== undefined && (
              <Badge variant="secondary" className="w-fit">
                {PRICE_TIER_LABEL[priceTier]}
              </Badge>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm leading-normal text-muted-foreground">
            <span>{district}</span>
            {distanceKm != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDistanceKm(distanceKm)}</span>
              </>
            )}
          </p>
          {hasSearchContext && (
            <p className="text-sm leading-normal text-muted-foreground">
              {reviewCount ? `${reviewCount} reviews` : "No reviews yet"}
            </p>
          )}
          {snippet && (
            <p className="truncate text-sm leading-normal text-muted-foreground">
              {snippet}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default BusinessCard;
