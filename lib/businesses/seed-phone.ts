import { createHash } from "node:crypto";

// Deterministic E.164 Sri Lankan mobile (+9477XXXXXXX) derived from a
// business slug so re-seeding never reshuffles numbers, and CLAIM-01 has a
// listed number on every seeded listing without editing the 107-row JSON.
export function seedPhoneForSlug(slug: string): string {
  const hash = createHash("sha256").update(`lankareview-seed-phone:${slug}`).digest();
  const n = hash.readUInt32BE(0) % 10_000_000;
  return `+9477${n.toString().padStart(7, "0")}`;
}
