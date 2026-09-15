// REV-03/REV-06: the review-filter engine. A documented, rules-based
// scoring function — explicitly NOT an ML model (spec calls this the
// "rules" half of a future "rules + ML hybrid"; ML is out of scope for this
// phase). The author is NEVER told which bucket they landed in (spec 6.3) —
// callers of this module must not leak `visibilityStatus`/`filterReason`
// back into any response the review's own author receives.
//
// This module is a pure function over already-gathered signal values so it
// stays independently unit-testable without a database — see
// lib/reviews/gather-review-signals.ts for the DB-querying side that
// produces a ReviewFilterSignals value for a real review.

export type ReviewVisibilityStatus = "recommended" | "not_recommended";

export interface ReviewFilterSignals {
  // Hours since the reviewer's account was created.
  accountAgeHours: number;
  // True if this is the reviewer's first-ever review on the platform.
  isFirstReview: boolean;
  // How many reviews (any business) this reviewer has posted before this one.
  priorReviewCount: number;
  // How many reviews (any business, excluding this one) this reviewer has
  // posted in the last 60 minutes — a review-farm/burst signature (spec 6.3).
  reviewsLastHour: number;
  // Highest Jaccard-trigram similarity (0..1) between this review's text and
  // any comparison text (the reviewer's own other recent reviews, plus a
  // small platform-wide sample) — a signal of templated/copy-pasted content.
  maxTextSimilarity: number;
}

export interface ReviewFilterInput {
  text: string;
  signals: ReviewFilterSignals;
}

export interface ReviewFilterResult {
  visibilityStatus: ReviewVisibilityStatus;
  // Human-readable audit summary — internal-only, never shown to the
  // author or any public API caller.
  filterReason: string;
  // Raw signal values plus the derived weak/strong counts, captured
  // verbatim for a future advertiser-parity audit (REV-06).
  filterSignals: ReviewFilterSignals & {
    weakSignalCount: number;
    strongSignalCount: number;
    weakSignalNames: string[];
    strongSignalNames: string[];
  };
}

// --- Documented thresholds (the ONLY place these numbers live) ---

// Account age below this is "new" for the low-reviewer-history signal.
const NEW_ACCOUNT_HOURS = 24;

// More than this many reviews (any business) in the trailing hour is a
// burst-posting signal ("this project only allows one review per user per
// business, so 'burst' here means reviewing many DIFFERENT businesses
// rapidly" — this chunk's spec note).
const BURST_THRESHOLD = 3;

// Above this Jaccard-trigram similarity to a prior review, text is treated
// as templated/copy-pasted — a strong signal on its own.
const HIGH_SIMILARITY_THRESHOLD = 0.8;

function evaluateWeakSignals(signals: ReviewFilterSignals): string[] {
  const weak: string[] = [];

  // Deliberately ONE combined signal, not two — a genuinely new user's
  // honest first review (both conditions true at once) must not be
  // double-penalized into automatic filtering on its own.
  if (signals.accountAgeHours < NEW_ACCOUNT_HOURS || signals.isFirstReview) {
    weak.push("low_reviewer_history");
  }

  if (signals.reviewsLastHour > BURST_THRESHOLD) {
    weak.push("burst_posting");
  }

  return weak;
}

function evaluateStrongSignals(signals: ReviewFilterSignals): string[] {
  const strong: string[] = [];

  if (signals.maxTextSimilarity > HIGH_SIMILARITY_THRESHOLD) {
    strong.push("high_text_similarity");
  }

  return strong;
}

const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  low_reviewer_history: "reviewer has little to no account history (new account or first review)",
  burst_posting: "reviewer posted a burst of reviews across multiple businesses in the last hour",
  high_text_similarity: "review text is highly similar to a prior review (possible templated/copy-pasted content)",
};

function buildFilterReason(weak: string[], strong: string[]): string {
  const triggered = [...strong, ...weak];
  if (triggered.length === 0) {
    return "No filter signals triggered.";
  }
  return triggered.map((name) => SIGNAL_DESCRIPTIONS[name]).join("; ") + ".";
}

export function classifyReview(input: ReviewFilterInput): ReviewFilterResult {
  const { signals } = input;
  const weakSignalNames = evaluateWeakSignals(signals);
  const strongSignalNames = evaluateStrongSignals(signals);

  // Decision rule (documented, intentionally simple — not an ML model):
  // any 1 strong signal, OR 2+ weak signals, tips the review to
  // not_recommended. Otherwise recommended.
  const visibilityStatus: ReviewVisibilityStatus =
    strongSignalNames.length >= 1 || weakSignalNames.length >= 2
      ? "not_recommended"
      : "recommended";

  return {
    visibilityStatus,
    filterReason: buildFilterReason(weakSignalNames, strongSignalNames),
    filterSignals: {
      ...signals,
      weakSignalCount: weakSignalNames.length,
      strongSignalCount: strongSignalNames.length,
      weakSignalNames,
      strongSignalNames,
    },
  };
}
