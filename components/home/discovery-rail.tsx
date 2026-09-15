import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Condensed rail-card business shape — a strict subset of
// BusinessCardProps (components/directory/business-card.tsx). Deliberately
// omits `reviewCount`/`snippet`: rail cards (02-UI-SPEC.md "Rail cards")
// show exactly one metadata line (category · price tier or distance) and
// never a snippet, which BusinessCard's shared component can't express on
// its own (any of its search-context props being present also renders a
// "No reviews yet" line) — so this condensed card is assembled here from
// the same shared primitives (Card/Badge/AspectRatio) rather than reusing
// BusinessCard's own render output, and rather than a fourth exported card
// component elsewhere in the tree.
export interface DiscoveryRailBusiness {
  slug: string;
  name: string;
  primaryCategory: string;
  categoryLabel: string;
  district: string;
  photoUrl: string | null;
  priceTier?: 1 | 2 | 3 | 4;
  distanceKm?: number | null;
  openNow?: boolean;
}

export interface DiscoveryRailProps {
  heading: string;
  businesses: DiscoveryRailBusiness[];
}

const PRICE_TIER_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

function metadataLine(business: DiscoveryRailBusiness): string {
  const priceOrDistance =
    business.priceTier !== undefined
      ? PRICE_TIER_LABEL[business.priceTier]
      : business.distanceKm != null
        ? `${business.distanceKm.toFixed(1)} km`
        : null;
  return priceOrDistance
    ? `${business.categoryLabel} · ${priceOrDistance}`
    : business.categoryLabel;
}

function RailCardPhoto({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  if (!photoUrl) {
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
        sizes="(min-width: 640px) 280px, 240px"
        className="object-cover"
      />
    </AspectRatio>
  );
}

function RailCard({ business }: { business: DiscoveryRailBusiness }) {
  return (
    <Link
      href={`/business/${business.slug}`}
      data-primary-category={business.primaryCategory}
      className="block w-[240px] min-h-11 shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[280px]"
    >
      <Card className="h-full transition-colors hover:bg-secondary/60">
        <CardContent className="flex flex-col gap-2">
          <RailCardPhoto photoUrl={business.photoUrl} name={business.name} />
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base leading-[1.2] font-semibold">
              {business.name}
            </h3>
            {business.openNow !== undefined && (
              <Badge
                className={
                  business.openNow
                    ? "shrink-0 bg-status-open text-white"
                    : "shrink-0 bg-status-closed text-white"
                }
              >
                {business.openNow ? "Open now" : "Closed"}
              </Badge>
            )}
          </div>
          <p className="text-sm leading-normal text-muted-foreground">
            {metadataLine(business)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

// DiscoveryRail — horizontal-scroll condensed card rail for the home page
// (02-UI-SPEC.md "Home / discovery page"). Hides entirely (renders `null`,
// no DOM at all) when `businesses` is empty, per the "Rail empty/fallback"
// copywriting row — an empty rail with a heading looks broken, not honest.
export function DiscoveryRail({ heading, businesses }: DiscoveryRailProps) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl leading-[1.2] font-semibold">{heading}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {businesses.map((business) => (
          <RailCard key={business.slug} business={business} />
        ))}
      </div>
    </section>
  );
}

export default DiscoveryRail;
