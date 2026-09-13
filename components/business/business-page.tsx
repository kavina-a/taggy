import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BusinessMapDynamic } from "@/components/business/business-map-dynamic";
import { HoursAccordion } from "@/components/business/hours-accordion";
import type { BusinessDetail } from "@/lib/types/business";

export interface BusinessPageViewProps {
  business: BusinessDetail;
  // `null` = not computed (should not happen once app/business/[slug]/page.tsx
  // always passes a real boolean from computeOpenNow; kept nullable so this
  // presentational component stays independently testable).
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

      {openNow !== null && (
        <>
          <Separator />

          <section aria-labelledby="hours-heading" className="flex flex-col gap-2">
            <h2 id="hours-heading" className="text-xl leading-[1.2] font-semibold">
              Hours
            </h2>
            <HoursAccordion
              hours={business.hours}
              overrides={business.hoursOverrides}
              openNow={openNow}
            />
          </section>
        </>
      )}
    </article>
  );
}

export default BusinessPageView;
