// Simple, dependency-free trigram/Jaccard text similarity, used by
// gather-review-signals.ts to compute REV-03/REV-06's "high text
// similarity" signal. Deliberately not a full ML embedding comparison —
// this phase's spec explicitly calls for a rules-based filter, not an ML
// model.

function toTrigrams(text: string): Set<string> {
  const normalized = text.toLowerCase().trim().replace(/\s+/g, " ");
  if (normalized.length === 0) return new Set();
  if (normalized.length < 3) return new Set([normalized]);

  const grams = new Set<string>();
  for (let i = 0; i <= normalized.length - 3; i++) {
    grams.add(normalized.slice(i, i + 3));
  }
  return grams;
}

// Jaccard similarity over character trigrams: |A ∩ B| / |A ∪ B|, in [0, 1].
export function jaccardTrigramSimilarity(a: string, b: string): number {
  const setA = toTrigrams(a);
  const setB = toTrigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const gram of setA) {
    if (setB.has(gram)) intersectionSize++;
  }
  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

// Highest similarity between `text` and any entry in `comparisons` — the
// single scalar signal review-filter.ts's maxTextSimilarity threshold
// operates on.
export function maxSimilarity(text: string, comparisons: string[]): number {
  let max = 0;
  for (const comparison of comparisons) {
    const similarity = jaccardTrigramSimilarity(text, comparison);
    if (similarity > max) max = similarity;
  }
  return max;
}
