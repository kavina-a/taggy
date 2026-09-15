import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

// T-02-06: OTP codes are HMAC-SHA256 hashed at generation time before ever
// touching a database row; no plaintext code column exists in OtpChallenge.
// T-02-02: brute-force resistance depends on hashOtpCode being deterministic
// (so a stored hash can be re-derived and compared) and verifyOtpCode using
// a constant-time comparison, never a naive `===`/early-return string
// comparison (see Node's timingSafeEqual, the documented constant-time
// primitive for this exact class of secret comparison).

export const OTP_EXPIRY_MS = 5 * 60 * 1000;

/** Generates a 6-digit, zero-padded numeric OTP code, e.g. "004821". */
export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Deterministically hashes an OTP code via HMAC-SHA256. Never returns the plaintext code. */
export function hashOtpCode(code: string): string {
  return createHmac("sha256", process.env.OTP_HMAC_SECRET!).update(code).digest("hex");
}

/**
 * Verifies a candidate code against a stored hash using a constant-time
 * comparison. Guards unequal-length buffers before calling
 * `timingSafeEqual`, since it throws (rather than returning false) when
 * given buffers of different lengths.
 */
export function verifyOtpCode(code: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtpCode(code));
  const stored = Buffer.from(storedHash);
  if (candidate.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(candidate, stored);
}
