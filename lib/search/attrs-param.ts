// Category-conditional attribute filters (SRCH-03) need to round-trip
// through a single fixed URL query key (`attrs`) since
// lib/search/search-params.schema.ts's `.strict()` schema can't enumerate
// every possible category's boolean attribute keys ahead of time. Format:
// "key1:true,key2:true" — boolean-only, matching 02-UI-SPEC.md's
// "checkboxes" wording for category-conditional attributes (Task 1).

export function parseAttrsParam(attrs: string | undefined): Record<string, boolean> | undefined {
  if (!attrs) return undefined;

  const out: Record<string, boolean> = {};
  for (const pair of attrs.split(",")) {
    const [key, value] = pair.split(":");
    if (key) out[key] = value === "true";
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
