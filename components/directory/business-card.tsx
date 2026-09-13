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
}: BusinessCardProps) {
  return (
    <Link
      href={`/business/${slug}`}
      data-primary-category={primaryCategory}
      className="block min-h-11 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors hover:bg-secondary/60">
        <CardContent className="flex flex-col gap-2">
          <CardPhoto photoUrl={photoUrl} name={name} />
          <h3 className="text-xl leading-[1.2] font-semibold">{name}</h3>
          <Badge variant="secondary" className="w-fit">
            {categoryLabel}
          </Badge>
          <p className="text-sm leading-normal text-muted-foreground">
            {district}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default BusinessCard;
