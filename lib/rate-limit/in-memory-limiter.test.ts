import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./in-memory-limiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to max calls within windowMs, then rejects the (max+1)th", async () => {
    const key = `test-key-${Math.random()}`;
    const opts = { max: 3, windowMs: 60_000 };

    expect(await checkRateLimit(key, opts)).toBe(true);
    expect(await checkRateLimit(key, opts)).toBe(true);
    expect(await checkRateLimit(key, opts)).toBe(true);
    expect(await checkRateLimit(key, opts)).toBe(false);
  });

  it("resets and allows calls again once windowMs has elapsed since the key's first call", async () => {
    const key = `test-key-${Math.random()}`;
    const opts = { max: 1, windowMs: 60_000 };

    expect(await checkRateLimit(key, opts)).toBe(true);
    expect(await checkRateLimit(key, opts)).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(await checkRateLimit(key, opts)).toBe(true);
  });

  it("tracks different keys independently", async () => {
    const keyA = `test-key-a-${Math.random()}`;
    const keyB = `test-key-b-${Math.random()}`;
    const opts = { max: 1, windowMs: 60_000 };

    expect(await checkRateLimit(keyA, opts)).toBe(true);
    expect(await checkRateLimit(keyA, opts)).toBe(false);
    // keyB is unaffected by keyA hitting its limit
    expect(await checkRateLimit(keyB, opts)).toBe(true);
  });
});
