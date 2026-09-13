import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BusinessMapDynamic } from "@/components/business/business-map-dynamic";
import type { BusinessDetail } from "@/lib/types/business";

export interface BusinessPageViewProps {
  business: BusinessDetail;
  // `null` = not computed yet (this plan). 01-02 passes a real boolean and
  // this component renders the "Open now"/"Closed" badge for a boolean.
  openNow: boolean | null;
}

export function BusinessPageView({ business, openNow }: BusinessPageViewProps) {
  const directionsHref = `https://www.google.com/maps?q=${business.latitude},${business.longitude}`;

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-[1.2] font-semibold">
          {business.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {business.primaryCategories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
          {openNow !== null && (
            <Badge
              className={
                openNow
                  ? "bg-status-open text-white"
                  : "bg-status-closed text-white"
              }
            >
              {openNow ? "Open now" : "Closed"}
            </Badge>
          )}
        </div>
      </header>

      <Separator />

      <section aria-labelledby="about-heading" className="flex flex-col gap-2">
        <h2 id="about-heading" className="text-xl leading-[1.2] font-semibold">
          About
        </h2>
        <p className="text-base leading-normal text-foreground">
          {business.description}
        </p>
      </section>

      <Separator />

      <section aria-labelledby="address-heading" className="flex flex-col gap-2">
        <h2 id="address-heading" className="text-xl leading-[1.2] font-semibold">
          Address
        </h2>
        <p className="text-base leading-normal text-foreground">
          {business.district} &middot; {business.addressFreeText}
        </p>
        <BusinessMapDynamic
          latitude={business.latitude}
          longitude={business.longitude}
          name={business.name}
        />
        <Button asChild className="w-fit min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90">
          <a href={directionsHref} target="_blank" rel="noopener noreferrer">
            Get Directions
          </a>
        </Button>
      </section>
    </article>
  );
}

export default BusinessPageView;
