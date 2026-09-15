// MOD-01: real-time profanity/hate-speech/PII classifier, run synchronously
// on every review before publish. A full ML model is explicitly out of
// bootstrap-budget scope (PROJECT.md Constraints) — this is a deliberately
// simple, rule-based (regex/word-list) hard block on genuinely disallowed
// content. This is NOT the same system as lib/reviews/review-filter.ts's
// soft recommended/not_recommended visibility filter: a `blocked: true`
// result here means the submission is rejected outright and the reasons
// below ARE shown to the author — the review-filter's outcome, by contrast,
// must never be disclosed.

export interface ClassifyContentResult {
  blocked: boolean;
  reasons: string[];
}

// Deliberately not exhaustive (a full profanity/slur corpus is future work
// per the phase scope note) — covers the clear, unambiguous cases the spec
// calls out: explicit profanity and a couple of representative slurs.
// Matched with word-boundary regexes so a word merely containing one of
// these as a substring (e.g. "classy", "passionate", "assuring") never
// false-positives.
const PROFANITY_TERMS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "slut",
  "whore",
  "dickhead",
  "motherfucker",
  "nigger",
  "retard",
];

// Leading \b only (not trailing): catches inflected forms like "fucking" or
// "shitty" while still requiring the match to START at a real word boundary
// so it can never fire mid-word (e.g. a term appearing after a letter).
const PROFANITY_REGEX = new RegExp(`\\b(${PROFANITY_TERMS.join("|")})`, "i");

// Sri Lankan phone formats only (spec-scoped): local 0XXXXXXXXX (10 digits
// starting with 0) and international +94XXXXXXXXX (9 digits after the
// country code). Word-boundary-anchored so it doesn't match a substring of
// a longer unrelated digit run.
const SL_PHONE_REGEX = /(?<!\d)(0\d{9}|\+94\d{9})(?!\d)/;

// Deliberately simple RFC-5322-adjacent email pattern — good enough to
// catch "share my email so we can talk off-platform" attempts without
// trying to be a fully compliant email-address validator.
const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

// Credit-card-like sequences: 13-19 digits, optionally grouped by spaces or
// dashes in runs of 4 (the near-universal card-number display format). Not
// a Luhn check — this is a coarse PII-shaped-content guard, not a payment
// validator.
const CARD_REGEX = /\b(?:\d[ -]?){13,19}\b/;

function countCardDigits(match: string): number {
  return match.replace(/[^0-9]/g, "").length;
}

export function classifyContent(text: string): ClassifyContentResult {
  const reasons: string[] = [];

  if (PROFANITY_REGEX.test(text)) {
    reasons.push("profanity");
  }

  if (SL_PHONE_REGEX.test(text)) {
    reasons.push("pii_phone");
  }

  if (EMAIL_REGEX.test(text)) {
    reasons.push("pii_email");
  }

  const cardMatch = text.match(CARD_REGEX);
  if (cardMatch && countCardDigits(cardMatch[0]) >= 13) {
    reasons.push("pii_card");
  }

  return { blocked: reasons.length > 0, reasons };
}
