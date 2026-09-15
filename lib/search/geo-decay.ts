// Exponential decay: full score (1.0) within `offsetKm`, halving every
// `scaleKm` beyond that — same shape as Elasticsearch's `exp` decay function
// (decay=0.5), chosen so a future OpenSearch migration can reuse the exact
// same origin/scale/offset/decay parameters (02-RESEARCH.md Pattern 2).
// [CITED: elastic.co function_score decay functions]
//
// This is a plain TypeScript function (not SQL) because it's also called
// from application code (e.g. re-scoring/testing), not only from
// lib/search/run-search-query.ts's raw SQL, which expresses the exact same
// formula shape directly in the query (see that file's GEO_OFFSET_KM /
// GEO_SCALE_KM constants) rather than invoking this function from inside SQL.
export function geoDecayScore(
  distanceKm: number,
  offsetKm = 1,
  scaleKm = 5,
): number {
  const raw = Math.pow(0.5, Math.max(0, distanceKm - offsetKm) / scaleKm);
  // Defensive clamp — POWER(0.5, x) for x >= 0 is always in (0, 1], but
  // clamping keeps the contract ("never outside [0, 1]") explicit and safe
  // against any future formula tweak.
  return Math.min(1, Math.max(0, raw));
}
