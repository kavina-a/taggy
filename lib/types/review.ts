export interface ReviewPhotoItem {
  id: string;
  url: string;
  caption: string | null;
}

// Shape returned by GET /api/businesses/[slug]/reviews and consumed by
// components/reviews/*. Dates are ISO 8601 strings (never raw Date objects)
// — matches this codebase's existing convention of converting Prisma Dates
// to strings before they cross a Server Component -> Client Component
// boundary (see app/business/[slug]/page.tsx's hoursOverrides mapping).
//
// `userAccountCreatedAt`/`userReviewCount` exist solely to feed REV-05's
// reviewer-credibility term (lib/reviews/sort-reviews.ts) — deliberately NOT
// rendered as a precise "member since" date anywhere in the UI. Exposing a
// reviewer's account age is a public review-platform norm (contributes to
// ranking only), but no requirement asks for displaying it, so this chunk
// doesn't add UI copy for it beyond the Anonymous-name fallback.
export interface ReviewListItem {
  id: string;
  userId: string;
  userName: string | null;
  userAccountCreatedAt: string;
  userReviewCount: number;
  rating: number;
  text: string;
  visitDate: string | null;
  visibilityStatus: "recommended" | "not_recommended";
  editedAt: string | null;
  createdAt: string;
  photos: ReviewPhotoItem[];
}
