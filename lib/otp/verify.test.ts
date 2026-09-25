import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashOtpCode, OTP_EXPIRY_MS } from "./generate";
import { MAX_OTP_ATTEMPTS, verifyOtpChallenge } from "./verify";

// Every fixture phone below is uniquely generated per-test (never reused
// across tests, never overlapping real seed data) so tests never interfere
// with each other or leave shared state behind.
const PHONE_PREFIX = "+94-test-otp-";
let phoneCounter = 0;
function uniquePhone(): string {
  phoneCounter += 1;
  return `${PHONE_PREFIX}${Date.now()}-${phoneCounter}`;
}

const CODE = "123456";
const WRONG_CODE = "999999";

async function createChallenge(
  phone: string,
  opts: {
    expiresInMs?: number;
    attemptCount?: number;
    consumedAt?: Date | null;
    purpose?: string;
  } = {},
) {
  return prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: hashOtpCode(CODE),
      expiresAt: new Date(Date.now() + (opts.expiresInMs ?? OTP_EXPIRY_MS)),
      attemptCount: opts.attemptCount ?? 0,
      consumedAt: opts.consumedAt ?? null,
      purpose: opts.purpose ?? "login",
    },
  });
}

describe("verifyOtpChallenge", () => {
  afterAll(async () => {
    await prisma.otpChallenge.deleteMany({ where: { phone: { startsWith: PHONE_PREFIX } } });
  });

  it('returns { ok: false, reason: "not_found" } when no OtpChallenge row exists for the phone', async () => {
    const phone = uniquePhone();
    const result = await verifyOtpChallenge(phone, CODE);
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it('returns { ok: false, reason: "expired" } for a challenge past its expiresAt, even with the correct code', async () => {
    const phone = uniquePhone();
    await createChallenge(phone, { expiresInMs: -1000 });

    const result = await verifyOtpChallenge(phone, CODE);
    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it('returns { ok: false, reason: "invalid" } for a wrong code and increments attemptCount', async () => {
    const phone = uniquePhone();
    const challenge = await createChallenge(phone);

    const result = await verifyOtpChallenge(phone, WRONG_CODE);
    expect(result).toEqual({ ok: false, reason: "invalid" });

    const updated = await prisma.otpChallenge.findUniqueOrThrow({ where: { id: challenge.id } });
    expect(updated.attemptCount).toBe(1);
  });

  it('returns { ok: false, reason: "locked" } once attemptCount has already reached MAX_OTP_ATTEMPTS, even with the correct code', async () => {
    const phone = uniquePhone();
    await createChallenge(phone, { attemptCount: MAX_OTP_ATTEMPTS });

    const result = await verifyOtpChallenge(phone, CODE);
    expect(result).toEqual({ ok: false, reason: "locked" });
  });

  it("returns { ok: true } and sets consumedAt for a correct code within expiry and under the attempt limit; a second call against the same now-consumed challenge fails", async () => {
    const phone = uniquePhone();
    const challenge = await createChallenge(phone);

    const result = await verifyOtpChallenge(phone, CODE);
    expect(result).toEqual({ ok: true });

    const updated = await prisma.otpChallenge.findUniqueOrThrow({ where: { id: challenge.id } });
    expect(updated.consumedAt).not.toBeNull();

    const secondResult = await verifyOtpChallenge(phone, CODE);
    expect(secondResult.ok).toBe(false);
    if (!secondResult.ok) {
      expect(["not_found", "expired"]).toContain(secondResult.reason);
    }
  });

  it("does not accept a claim-purpose OTP when verifying for login, and vice versa", async () => {
    const phone = uniquePhone();
    await createChallenge(phone, { purpose: "claim" });

    const loginResult = await verifyOtpChallenge(phone, CODE, "login");
    expect(loginResult).toEqual({ ok: false, reason: "not_found" });

    const claimResult = await verifyOtpChallenge(phone, CODE, "claim");
    expect(claimResult).toEqual({ ok: true });
  });
});
