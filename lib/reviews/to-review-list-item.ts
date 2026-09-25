import type { Prisma } from "@/lib/generated/prisma/client";
import type { ReviewListItem } from "@/lib/types/review";

export const reviewListInclude = {
  user: { select: { name: true, createdAt: true, _count: { select: { reviews: true } } } },
  photos: { select: { id: true, url: true, caption: true } },
  ownerResponse: { select: { id: true, text: true, createdAt: true, editedAt: true } },
} satisfies Prisma.ReviewInclude;

export type ReviewListRow = Prisma.ReviewGetPayload<{ include: typeof reviewListInclude }>;

export function toReviewListItem(
  review: ReviewListRow,
  viewerVotes: Array<"useful" | "funny" | "cool"> = [],
): ReviewListItem {
  return {
    id: review.id,
    userId: review.userId,
    userName: review.user.name,
    userAccountCreatedAt:
      review.user.createdAt instanceof Date
        ? review.user.createdAt.toISOString()
        : String(review.user.createdAt),
    userReviewCount: review.user._count.reviews,
    rating: review.rating,
    text: review.text,
    visitDate: review.visitDate
      ? review.visitDate instanceof Date
        ? review.visitDate.toISOString()
        : String(review.visitDate)
      : null,
    visibilityStatus: review.visibilityStatus,
    editedAt: review.editedAt
      ? review.editedAt instanceof Date
        ? review.editedAt.toISOString()
        : String(review.editedAt)
      : null,
    createdAt:
      review.createdAt instanceof Date
        ? review.createdAt.toISOString()
        : String(review.createdAt),
    photos: review.photos,
    usefulCount: review.usefulCount,
    funnyCount: review.funnyCount,
    coolCount: review.coolCount,
    viewerVotes,
    ownerResponse: review.ownerResponse
      ? {
          id: review.ownerResponse.id,
          text: review.ownerResponse.text,
          createdAt:
            review.ownerResponse.createdAt instanceof Date
              ? review.ownerResponse.createdAt.toISOString()
              : String(review.ownerResponse.createdAt),
          editedAt: review.ownerResponse.editedAt
            ? review.ownerResponse.editedAt instanceof Date
              ? review.ownerResponse.editedAt.toISOString()
              : String(review.ownerResponse.editedAt)
            : null,
        }
      : null,
  };
}
