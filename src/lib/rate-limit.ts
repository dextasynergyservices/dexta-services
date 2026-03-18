/**
 * In-memory sliding-window rate limiter.
 *
 * Good for single-server / long-running deployments.
 * For serverless (Vercel), swap to Upstash Redis for cross-instance limits.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
  // Allow the process to exit without waiting for the timer
  if (
    cleanupTimer &&
    typeof cleanupTimer === "object" &&
    "unref" in cleanupTimer
  ) {
    cleanupTimer.unref();
  }
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const { max, windowMs } = config;
  const now = Date.now();

  ensureCleanup(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= max) {
    const oldest = entry.timestamps[0]!;
    return {
      success: false,
      remaining: 0,
      resetMs: oldest + windowMs - now,
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    remaining: max - entry.timestamps.length,
    resetMs: windowMs,
  };
}

// Pre-configured limiters for common use cases
export const RATE_LIMITS = {
  /** Public form submissions: 5 per 15 minutes */
  form: { max: 5, windowMs: 15 * 60 * 1000 },
  /** Login attempts: 5 per 15 minutes */
  login: { max: 5, windowMs: 15 * 60 * 1000 },
  /** Contact form: 3 per 15 minutes */
  contact: { max: 3, windowMs: 15 * 60 * 1000 },
} as const;
