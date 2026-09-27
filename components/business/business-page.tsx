"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";
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
import {
  ReviewComposer,
  type ExistingReviewForComposer,
} from "@/components/reviews/review-composer";
import { ReviewList } from "@/components/reviews/review-list";
import { ClaimListingCard } from "@/components/business/claim-listing-card";
import { ReportButton } from "@/components/reports/report-button";
import { PhotoUploadForm } from "@/components/photos/photo-upload-form";
import { QuestionList } from "@/components/qa/question-list";
import { SaveBusinessButton } from "@/components/collections/save-business-button";
import { OwnerListingEditor } from "@/components/business/owner-listing-editor";
import { DiscoveryRail, type DiscoveryRailBusiness } from "@/components/home/discovery-rail";
import { getCategoryLabel } from "@/lib/categories/category-config";
import { en, type Messages } from "@/lib/i18n/messages";
import type { BusinessDetail } from "@/lib/types/business";
import type { ReviewListItem } from "@/lib/types/review";
import type { QuestionListItem } from "@/lib/types/qa";
import type { CollectionMembership } from "@/lib/types/collection";

export interface BusinessPageViewProps {
  business: BusinessDetail;
  openNow: boolean | null;
  reviews?: ReviewListItem[];
  notRecommendedCount?: number;
  currentUserId?: string | null;
  existingReview?: ExistingReviewForComposer | null;
  isOwner?: boolean;
  questions?: QuestionListItem[];
  collectionMemberships?: CollectionMembership[];
  relatedBusinesses?: DiscoveryRailBusiness[];
  copy?: Messages;
}

export function BusinessPageView({
  business,
  openNow,
  reviews = [],
  notRecommendedCount = 0,
  currentUserId = null,
  existingReview = null,
  isOwner = false,
  questions = [],
  collectionMemberships = [],
  relatedBusinesses = [],
  copy = en,
}: BusinessPageViewProps) {
  const directionsHref = `https://www.google.com/maps?q=${business.latitude},${business.longitude}`;

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/directory">{copy.business.directory}</Link>
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

      {business.consumerAlert ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-4"
        >
          <p className="text-sm font-semibold text-destructive">{copy.business.consumerAlert}</p>
          <p className="text-base leading-normal text-foreground">{business.consumerAlert}</p>
        </div>
      ) : null}

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-[28px] leading-[1.2] font-semibold">
            {business.name}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="min-h-9 gap-1.5 text-sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: business.name, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href).then(() => alert("Link copied!"));
                }
              }}
            >
              <Share2 className="size-4" />
              Share
            </Button>
            <SaveBusinessButton
              businessId={business.id}
              currentUserId={currentUserId}
              memberships={collectionMemberships}
            />
          </div>
        </div>
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
              {copy.business.alsoListed}
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
          {copy.business.about}
        </h2>
        <p className="text-base leading-normal text-foreground">
          {business.description}
        </p>
      </section>

      <Separator />

      <section aria-labelledby="address-heading" className="flex flex-col gap-2">
        <h2 id="address-heading" className="text-xl leading-[1.2] font-semibold">
          {copy.business.address}
        </h2>
        <p className="text-base leading-normal text-foreground">
          {business.district} &middot; {business.addressFreeText}
        </p>
        {business.phone && (
          <p className="text-base leading-normal text-foreground">
            {copy.business.phone}: {business.phone}
          </p>
        )}
        <BusinessMapDynamic
          latitude={business.latitude}
          longitude={business.longitude}
          name={business.name}
        />
        <Button asChild className="w-fit min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90">
          <a href={directionsHref} target="_blank" rel="noopener noreferrer">
            {copy.business.getDirections}
          </a>
        </Button>
      </section>

      {openNow !== null && (
        <>
          <Separator />

          <section aria-labelledby="hours-heading" className="flex flex-col gap-2">
            <h2 id="hours-heading" className="text-xl leading-[1.2] font-semibold">
              {copy.business.hours}
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
          {copy.business.attributes}
        </h2>
        <AttributeBadges
          primaryCategory={business.primaryCategories[0]}
          attributes={business.attributes}
        />
      </section>

      <Separator />

      <section aria-labelledby="photos-heading" className="flex flex-col gap-2">
        <h2 id="photos-heading" className="text-xl leading-[1.2] font-semibold">
          {copy.business.photos}
        </h2>
        <PhotoGallery
          photos={business.photos}
          primaryCategories={business.primaryCategories}
          currentUserId={currentUserId}
        />
        <PhotoUploadForm businessSlug={business.slug} currentUserId={currentUserId} />
        <div className="flex flex-wrap gap-2">
          <ReportButton
            targetType="business"
            targetId={business.id}
            currentUserId={currentUserId}
            label="Report business"
          />
        </div>
      </section>

      <Separator />

      <section aria-labelledby="claim-heading" className="flex flex-col gap-2">
        <h2 id="claim-heading" className="text-xl leading-[1.2] font-semibold">
          {copy.business.owner}
        </h2>
        <ClaimListingCard
          businessSlug={business.slug}
          currentUserId={currentUserId}
          isClaimed={Boolean(business.claimedByUserId)}
          isOwner={isOwner}
        />
        {isOwner && (
          <OwnerListingEditor
            businessSlug={business.slug}
            description={business.description}
            addressFreeText={business.addressFreeText}
            hours={business.hours}
          />
        )}
      </section>

      <Separator />

      <section aria-labelledby="qa-heading" className="flex flex-col gap-2">
        <h2 id="qa-heading" className="text-xl leading-[1.2] font-semibold">
          {copy.business.qa}
        </h2>
        <QuestionList
          businessSlug={business.slug}
          questions={questions}
          currentUserId={currentUserId}
        />
      </section>

      <Separator />

      <section aria-labelledby="write-review-heading" className="flex flex-col gap-2">
        <h2 id="write-review-heading" className="text-xl leading-[1.2] font-semibold">
          {copy.business.writeReview}
        </h2>
        {currentUserId === null ? (
          <div id="write-a-review" className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-4">
            <p className="text-base leading-normal text-foreground">
              {copy.business.beenHere}
            </p>
            <Button asChild className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90">
              <Link href="/login">{copy.business.loginToReview}</Link>
            </Button>
          </div>
        ) : (
          <ReviewComposer businessId={business.id} existingReview={existingReview} />
        )}
      </section>

      <DiscoveryRail heading={copy.business.peopleAlsoViewed} businesses={relatedBusinesses} />

      <Separator />

      <section>
        <ReviewList
          businessSlug={business.slug}
          initialReviews={reviews}
          notRecommendedCount={notRecommendedCount}
          currentUserId={currentUserId}
          isOwner={isOwner}
        />
      </section>
    </article>
  );
}

export default BusinessPageView;
