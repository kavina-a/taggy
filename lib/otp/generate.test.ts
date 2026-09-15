import { describe, expect, it } from "vitest";
import {
  OTP_EXPIRY_MS,
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
} from "./generate";

describe("generateOtpCode", () => {
  it("always returns a 6-character numeric string, zero-padded", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    }
  });
});

describe("hashOtpCode", () => {
  it("is deterministic: same code -> same hash", () => {
    const code = "004821";
    expect(hashOtpCode(code)).toBe(hashOtpCode(code));
  });

  it("never equals the plaintext code itself", () => {
    const code = "004821";
    expect(hashOtpCode(code)).not.toBe(code);
  });
});

describe("verifyOtpCode", () => {
  it("returns true only when hashOtpCode(code) === hash", () => {
    const code = "123456";
    const hash = hashOtpCode(code);
    expect(verifyOtpCode(code, hash)).toBe(true);
  });

  it("returns false for a wrong code", () => {
    const hash = hashOtpCode("123456");
    expect(verifyOtpCode("654321", hash)).toBe(false);
  });

  it("returns false (not throws) when comparing against a hash of a different length", () => {
    expect(verifyOtpCode("123456", "not-a-real-hash")).toBe(false);
  });
});

describe("OTP_EXPIRY_MS", () => {
  it("equals exactly 5 minutes in milliseconds", () => {
    expect(OTP_EXPIRY_MS).toBe(300000);
  });
});
