// REV-05: default review-list ordering blends recency, reviewer credibility
// (account age / review-count proxy), and a currently-neutral "helpfulness"
// term — real Useful/Funny/Cool voting is Phase 4 (VOTE-01/02), so this term
// stays honestly neutral until that data exists, matching Phase 2's
// RATING_SCORE_NEUTRAL-before-real-ratings precedent (superseded once real
// avgRating/reviewCount landed in the 03-backend chunk). Also provides the
// explicit Newest/Highest/Lowest override (spec 6.2) as a pure client-side
// re-sort of already-fetched review data — no new API sort param needed.
//
// A pure, DB-free module (like classifyReview / computeOpenNow) so it stays
// independently unit-testable and can run identically on the server (initial
// SSR order) and in the browser (dropdown override), given the same `now`.

export interface SortableReview {
  id: string;
  rating: number;
  /** ISO 8601 timestamp the review was created. */
  createdAt: string;
  /** ISO 8601 timestamp the review's author's account was created. */
  userAccountCreatedAt: string;
  /** Reviewer's total review count across the platform (includes this one). */
  userReviewCount: number;
}

export type ReviewSortOption = "blended" | "newest" | "highest" | "lowest";

// --- Documented tuning constants (the ONLY place these numbers live) ---

// Recency half-life: a review's recency contribution halves every 30 days,
// asymptoting toward (but never reaching) zero — never fully dropping an old
// review out of the blend.
const RECENCY_HALF_LIFE_DAYS = 30;

// Credibility caps: account age contribution maxes out at one year old;
// review-count contribution maxes out around 10 prior reviews (log-scaled so
// a reviewer's 2nd review already contributes meaningfully more than their
// 1st, without a prolific reviewer's 100th review dominating the blend).
const CREDIBILITY_MAX_ACCOUNT_AGE_DAYS = 365;
const CREDIBILITY_REVIEW_COUNT_LOG_BASE = 11; // log10(11) normalizes ~10 reviews to 1.0

// Blend weights — sum to 1.0. HELPFULNESS_WEIGHT is kept (not deleted) so
// the day VOTE-01/02 lands, only HELPFULNESS_SCORE_NEUTRAL's replacement
// with a real computed value is needed, not a re-tuning of the other terms.
const RECENCY_WEIGHT = 0.5;
const CREDIBILITY_WEIGHT = 0.3;
const HELPFULNESS_WEIGHT = 0.2;

// Neutral placeholder — real Useful/Funny/Cool vote data doesn't exist yet
// (Phase 4). Deliberately 0, not a guess, so it contributes nothing to the
// blend rather than silently favoring/penalizing any review.
const HELPFULNESS_SCORE_NEUTRAL = 0;

function daysBetween(earlier: Date, later: Date): number {
  return Math.max(0, (later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
}

function computeRecencyScore(review: SortableReview, now: Date): number {
  const ageDays = daysBetween(new Date(review.createdAt), now);
  return Math.exp(-ageDays / RECENCY_HALF_LIFE_DAYS);
}

function computeCredibilityScore(review: SortableReview, now: Date): number {
  const accountAgeDays = daysBetween(new Date(review.userAccountCreatedAt), now);
  const ageComponent = Math.min(1, accountAgeDays / CREDIBILITY_MAX_ACCOUNT_AGE_DAYS);
  const countComponent = Math.min(
    1,
    Math.log10(review.userReviewCount + 1) / Math.log10(CREDIBILITY_REVIEW_COUNT_LOG_BASE),
  );
  return (ageComponent + countComponent) / 2;
}

function computeBlendedScore(review: SortableReview, now: Date): number {
  return (
    computeRecencyScore(review, now) * RECENCY_WEIGHT +
    computeCredibilityScore(review, now) * CREDIBILITY_WEIGHT +
    HELPFULNESS_SCORE_NEUTRAL * HELPFULNESS_WEIGHT
  );
}

function newestFirst(a: SortableReview, b: SortableReview): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortReviews(
  reviews: SortableReview[],
  option: ReviewSortOption,
  now: Date = new Date(),
): SortableReview[] {
  const copy = [...reviews];

  switch (option) {
    case "newest":
      return copy.sort(newestFirst);
    case "highest":
      return copy.sort((a, b) => b.rating - a.rating || newestFirst(a, b));
    case "lowest":
      return copy.sort((a, b) => a.rating - b.rating || newestFirst(a, b));
    case "blended":
    default:
      return copy.sort(
        (a, b) => computeBlendedScore(b, now) - computeBlendedScore(a, now) || newestFirst(a, b),
      );
  }
}

export default sortReviews;
