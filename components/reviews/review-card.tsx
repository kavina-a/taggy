import Link from "next/link";
import { Star, MapPin, User as UserIcon } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const userInitials = (review.userName ?? "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card
      size="sm"
      className={cn(variant === "filtered" && "border-dashed bg-muted/40")}
    >
      <CardContent className="flex flex-col gap-3">
        {/* Reviewer Profile Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Clickable Profile Avatar */}
            <Link
              href={`/user/${review.userId}`}
              className="group shrink-0 transition-transform hover:scale-105"
              title={`View ${displayName}'s profile`}
              aria-label={`View ${displayName}'s profile`}
            >
              <Avatar className="size-11 border-2 border-neutral-200 group-hover:border-[#D71616] transition-colors shadow-xs">
                {review.userAvatarUrl && (
                  <AvatarImage src={review.userAvatarUrl} alt={displayName} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-800 font-bold text-xs">
                  {userInitials || <UserIcon className="size-4 text-neutral-500" />}
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Reviewer Details */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/user/${review.userId}`}
                  className="text-base font-bold text-neutral-900 hover:text-[#D71616] hover:underline transition-colors leading-tight"
                >
                  {displayName}
                </Link>
                {review.userEliteYear && (
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#D71616] text-white tracking-wider">
                    Elite &apos;{String(review.userEliteYear).slice(-2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500 font-normal mt-0.5 flex-wrap">
                {review.userCity && (
                  <span className="flex items-center gap-1 text-neutral-600">
                    <MapPin className="size-3 text-neutral-400" />
                    {review.userCity}
                  </span>
                )}
                {review.userCity && <span>·</span>}
                <span className="flex items-center gap-1 text-neutral-600 font-medium">
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                  {review.userReviewCount} {review.userReviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
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

        {/* Rating and Date */}
        <div className="flex items-center gap-2 pt-0.5">
          <ReadOnlyStars rating={review.rating} />
          <span className="text-xs text-muted-foreground">
            {formatReviewDate(review.createdAt)}
            {review.editedAt && " · Edited"}
          </span>
        </div>

        {/* Review Text */}
        <p className="text-base leading-relaxed text-foreground">{review.text}</p>

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
