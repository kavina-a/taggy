import { prisma } from "@/lib/prisma";
import { verifyOtpCode } from "./generate";
import { OTP_PURPOSE_LOGIN, type OtpPurpose } from "./purpose";

// T-02-02: this bound (5 attempts) plus the 5-minute OTP_EXPIRY_MS
// (lib/otp/generate.ts) together keep the brute-force window well under
// the 1,000,000-code keyspace.
export const MAX_OTP_ATTEMPTS = 5;

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "locked" | "invalid" | "not_found" };

/**
 * Verifies a candidate OTP code against the most recent non-consumed
 * challenge for `phone`. Never re-validates an already-consumed challenge
 * (it simply won't be found — `consumedAt: null` excludes it from lookup).
 */
export async function verifyOtpChallenge(
  phone: string,
  code: string,
  purpose: OtpPurpose = OTP_PURPOSE_LOGIN,
): Promise<OtpVerifyResult> {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    return { ok: false, reason: "not_found" };
  }

  if (challenge.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  if (challenge.attemptCount >= MAX_OTP_ATTEMPTS) {
    return { ok: false, reason: "locked" };
  }

  if (!verifyOtpCode(code, challenge.codeHash)) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: { increment: 1 } },
    });
    return { ok: false, reason: "invalid" };
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true };
}
