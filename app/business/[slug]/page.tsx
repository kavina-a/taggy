import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BusinessPageView } from "@/components/business/business-page";
import type { BusinessDetail } from "@/lib/types/business";

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { hours: true, hoursOverrides: true, photos: true },
  });

  if (!business) {
    notFound();
  }

  const detail: BusinessDetail = {
    id: business.id,
    slug: business.slug,
    name: business.name,
    description: business.description,
    primaryCategories: business.primaryCategories,
    secondaryCategories: business.secondaryCategories,
    district: business.district,
    addressFreeText: business.addressFreeText,
    latitude: business.latitude,
    longitude: business.longitude,
    attributes: (business.attributes ?? {}) as Record<string, unknown>,
    hours: business.hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      crossesMidnight: h.crossesMidnight,
    })),
    hoursOverrides: business.hoursOverrides.map((o) => ({
      date: o.date.toISOString().slice(0, 10),
      isClosed: o.isClosed,
      openTime: o.openTime,
      closeTime: o.closeTime,
      crossesMidnight: o.crossesMidnight,
    })),
    photos: business.photos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: p.caption,
      sortOrder: p.sortOrder,
      isMenuPhoto: p.isMenuPhoto,
    })),
  };

  // "Open now" computation ships in 01-02; this plan only proves the LIST-01
  // fields render, so no badge is shown yet (BusinessPageView renders
  // nothing for a null openNow).
  return <BusinessPageView business={detail} openNow={null} />;
}
