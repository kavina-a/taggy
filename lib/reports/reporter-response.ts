// MOD-02: the reporter-facing API response is structurally incapable of
// leaking report outcome/status. Same pattern as
// lib/reviews/author-review-response.ts — a single shared serializer with
// a hard-coded allowlist, not a "remember not to leak it" discipline.
export interface ReporterConfirmation {
  ok: true;
}

export function toReporterConfirmation(): ReporterConfirmation {
  return { ok: true };
}
