"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BusinessPhotoRow } from "@/lib/types/business";

export interface PhotoGalleryProps {
  photos: BusinessPhotoRow[];
  primaryCategories: string[];
}

// Small static neutral-gray 1x1 PNG, base64-encoded, shared across every
// gallery tile as the next/image blur placeholder — UI-SPEC requires a blur
// placeholder, never a spinner-only loading state, for 3G/4G users.
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function sortBySortOrder(photos: BusinessPhotoRow[]): BusinessPhotoRow[] {
  return [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
}

function EmptyState({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary px-4 py-12 text-center">
      <p className="text-xl leading-[1.2] font-semibold">{heading}</p>
      <p className="text-base leading-normal text-muted-foreground">{body}</p>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: BusinessPhotoRow[] }) {
  if (photos.length === 0) {
    return (
      <EmptyState
        heading="No photos yet"
        body="Photos for this business haven't been added yet. Check back soon."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {sortBySortOrder(photos).map((photo) => (
        <AspectRatio
          key={photo.id}
          ratio={4 / 3}
          className="overflow-hidden rounded-md bg-secondary"
        >
          <Image
            src={photo.url}
            // Always a real, non-empty alt so this tile keeps the "img"
            // accessibility role (an empty alt maps to role "presentation").
            alt={photo.caption || "Business photo"}
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        </AspectRatio>
      ))}
    </div>
  );
}

export function PhotoGallery({ photos, primaryCategories }: PhotoGalleryProps) {
  const isRestaurant = primaryCategories.includes("restaurant");

  if (!isRestaurant) {
    // Non-restaurant categories never get a Tabs wrapper — plain grid only,
    // even if some photos happen to carry isMenuPhoto: true (T-03-03).
    return <PhotoGrid photos={photos} />;
  }

  const menuPhotos = photos.filter((p) => p.isMenuPhoto);
  const galleryPhotos = photos.filter((p) => !p.isMenuPhoto);

  return (
    <Tabs defaultValue="photos">
      <TabsList variant="line">
        <TabsTrigger
          value="photos"
          className="min-h-11 data-active:border-b-2 data-active:border-brand-accent"
        >
          Photos
        </TabsTrigger>
        <TabsTrigger
          value="menu"
          className="min-h-11 data-active:border-b-2 data-active:border-brand-accent"
        >
          Menu
        </TabsTrigger>
      </TabsList>
      <TabsContent value="photos">
        <PhotoGrid photos={galleryPhotos} />
      </TabsContent>
      <TabsContent value="menu">
        {menuPhotos.length === 0 ? (
          <EmptyState
            heading="Menu not available yet"
            body="This restaurant hasn't added menu photos yet."
          />
        ) : (
          <PhotoGrid photos={menuPhotos} />
        )}
      </TabsContent>
    </Tabs>
  );
}

export default PhotoGallery;
