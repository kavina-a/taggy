import Link from "next/link";
import { StarIcon } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";
import { VoteButtons } from "./vote-buttons";
import { OwnerResponseBlock, OwnerResponseComposer } from "./owner-response";
import { ReportButton } from "@/components/reports/report-button";
import { getRatingTierColor } from "@/components/ui/star-rating";
import type { ReviewListItem } from "@/lib/types/review";

export interface ReviewCardProps {
  review: ReviewListItem;
  /** Edit affordance renders only when this review belongs to the current session's user. */
  isOwnReview: boolean;
  currentUserId: string | null;
  isOwner?: boolean;
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
  const tierColor = getRatingTierColor(rating);
  return (
    <span aria-label={`Rating: ${rating} out of 5`} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ backgroundColor: n <= rating ? tierColor : "#C8C9CA" }}
          className="inline-flex size-4 items-center justify-center rounded-[3px] text-white"
        >
          <svg className="size-3 fill-current" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
          </svg>
        </span>
      ))}
    </span>
  );
}

export function ReviewCard({
  review,
  isOwnReview,
  currentUserId,
  isOwner = false,
  variant = "default",
}: ReviewCardProps) {
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
          <div className="flex items-center gap-1">
            {isOwnReview && (
              <Link
                href="#write-a-review"
                className="min-h-11 text-sm text-brand-accent underline underline-offset-4"
              >
                Edit
              </Link>
            )}
            <ReportButton
              targetType="review"
              targetId={review.id}
              currentUserId={currentUserId}
              label="Report review"
            />
          </div>
        </div>
        <p className="text-sm leading-normal text-muted-foreground">
          {formatReviewDate(review.createdAt)}
          {review.editedAt && " · Edited"}
        </p>
        <p className="text-base leading-normal text-foreground">{review.text}</p>
        {review.photos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.photos.map((photo) => (
              <div key={photo.id} className="flex flex-col items-start gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || "Review photo"}
                  loading="lazy"
                  className="h-20 w-20 rounded-md object-cover"
                />
                <ReportButton
                  targetType="photo"
                  targetId={photo.id}
                  currentUserId={currentUserId}
                  label="Report photo"
                />
              </div>
            ))}
          </div>
        )}
        <VoteButtons
          reviewId={review.id}
          usefulCount={review.usefulCount}
          funnyCount={review.funnyCount}
          coolCount={review.coolCount}
          viewerVotes={review.viewerVotes}
          currentUserId={currentUserId}
          isOwnReview={isOwnReview}
        />
        {review.ownerResponse && (
          <OwnerResponseBlock
            text={review.ownerResponse.text}
            editedAt={review.ownerResponse.editedAt}
          />
        )}
        {isOwner && (
          <OwnerResponseComposer
            reviewId={review.id}
            existingText={review.ownerResponse?.text ?? null}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default ReviewCard;
