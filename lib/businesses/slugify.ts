// URL slug for a newly created listing (CLAIM-01 "or create a new one").
// ASCII-only, matching the seeded Colombo slugs. Collision handling is the
// caller's job (append a short suffix) — this function is a pure transform.
export function slugifyBusinessName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return slug.length > 0 ? slug : "business";
}
