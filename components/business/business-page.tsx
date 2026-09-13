import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BusinessMapDynamic } from "@/components/business/business-map-dynamic";
import { HoursAccordion } from "@/components/business/hours-accordion";
import { AttributeBadges } from "@/components/business/attribute-badges";
import { PhotoGallery } from "@/components/business/photo-gallery";
import { getCategoryLabel } from "@/lib/categories/category-config";
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/directory">Directory</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {getCategoryLabel(business.primaryCategories[0]) ??
              business.primaryCategories[0]}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{business.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
        {business.secondaryCategories.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-normal text-muted-foreground">
              Also listed under
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {business.secondaryCategories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  data-testid="secondary-category-badge"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
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

      <Separator />

      <section aria-labelledby="attributes-heading" className="flex flex-col gap-2">
        <h2 id="attributes-heading" className="text-xl leading-[1.2] font-semibold">
          Attributes
        </h2>
        <AttributeBadges
          primaryCategory={business.primaryCategories[0]}
          attributes={business.attributes}
        />
      </section>

      <Separator />

      <section aria-labelledby="photos-heading" className="flex flex-col gap-2">
        <h2 id="photos-heading" className="text-xl leading-[1.2] font-semibold">
          Photos
        </h2>
        <PhotoGallery
          photos={business.photos}
          primaryCategories={business.primaryCategories}
        />
      </section>
    </article>
  );
}

export default BusinessPageView;
