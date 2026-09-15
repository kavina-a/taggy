// Pitfall 3 (02-RESEARCH.md): this limiter's state lives in a single Node
// process, backed by a module-level Map. It resets on every process
// restart (e.g. `next dev` reload) and is per-instance under any future
// multi-instance/serverless deployment — meaning the *effective* rate
// limit under N concurrent instances is `limit * N`, not `limit`. This is
// the correct, bootstrap-budget-appropriate choice for a single-instance
// dev deployment, but it silently weakens OTP abuse protection the moment
// this app deploys to more than one instance. The documented upgrade path
// is `@upstash/ratelimit` (a hosted Redis-backed limiter) wired in behind
// this exact same `checkRateLimit(key, opts): Promise<boolean>` signature
// — a one-file swap, no call-site changes required.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

const buckets = new Map<string, RateLimitEntry>();

/**
 * Allows up to `opts.max` calls for a given `key` within a rolling
 * `opts.windowMs` window. Returns `true` if the call is allowed, `false`
 * if the key has exceeded its limit for the current window. The window
 * resets `opts.windowMs` after the key's first call in the current window.
 */
export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<boolean> {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }

  if (entry.count >= opts.max) {
    return false;
  }

  entry.count += 1;
  return true;
}
