import Link from "next/link";
import { StarIcon } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";
import type { ReviewListItem } from "@/lib/types/review";

export interface ReviewCardProps {
  review: ReviewListItem;
  /** Edit affordance renders only when this review belongs to the current session's user. */
  isOwnReview: boolean;
  /** REV-04: distinguishes a not_recommended card in the disclosure panel. */
  variant?: "default" | "filtered";
}

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ReadOnlyStars({ rating }: { rating: number }) {
  return (
    <span aria-label={`Rating: ${rating} out of 5`} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          aria-hidden="true"
          className={cn("size-4", n <= rating ? "fill-brand-accent text-brand-accent" : "text-muted-foreground")}
        />
      ))}
    </span>
  );
}

// REV-04: no requirement asks a reviewer's account age to be displayed, so
// only the Anonymous-name fallback is decided here — a User with no `name`
// set (Phase 2's progressive profile allows skipping name entirely) shows
// as "Anonymous" rather than an empty heading.
export function ReviewCard({ review, isOwnReview, variant = "default" }: ReviewCardProps) {
  const displayName = review.userName ?? "Anonymous";

  return (
    <Card
      size="sm"
      className={cn(variant === "filtered" && "border-dashed bg-muted/40")}
    >
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-base leading-normal font-semibold">{displayName}</span>
            <ReadOnlyStars rating={review.rating} />
          </div>
          {isOwnReview && (
            <Link
              href="#write-a-review"
              className="min-h-11 text-sm text-brand-accent underline underline-offset-4"
            >
              Edit
            </Link>
          )}
        </div>
        <p className="text-sm leading-normal text-muted-foreground">
          {formatReviewDate(review.createdAt)}
          {review.editedAt && " · Edited"}
        </p>
        <p className="text-base leading-normal text-foreground">{review.text}</p>
        {review.photos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.photos.map((photo) => (
              // Deliberately a plain <img>, NOT next/image: review photos are
              // arbitrary already-hosted URLs the reviewer supplies (no
              // upload infra yet, per the backend chunk's simplification),
              // and next.config.ts's images.remotePatterns is intentionally
              // restricted to picsum.photos only (T-03-02, security) — never
              // widened to accept arbitrary user-supplied hostnames.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.caption || "Review photo"}
                loading="lazy"
                className="h-20 w-20 rounded-md object-cover"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReviewCard;
