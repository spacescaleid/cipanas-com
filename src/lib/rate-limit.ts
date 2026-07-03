// src/lib/rate-limit.ts

/**
 * Simple in-memory rate limiter.
 * Cocok untuk single-instance deployment (Vercel serverless).
 * Untuk multi-instance, ganti ke @upstash/ratelimit + Redis.
 *
 * CATATAN: di serverless, state akan direset tiap cold start.
 * Ini masih berguna untuk mencegah burst request dari IP yang sama
 * dalam satu sesi warm function.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries tiap 60 detik
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, 60_000);
}

interface RateLimitConfig {
  /** Jumlah request maksimal dalam window */
  limit: number;
  /** Window waktu dalam detik */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Cek rate limit berdasarkan key (biasanya IP address).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Entry tidak ada atau sudah expired → reset
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }

  // Masih dalam window → increment
  entry.count++;

  if (entry.count > config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Helper: ambil IP dari request (support Vercel proxy headers).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// ─── Preset configs ────────────────────────────────────────────

/** Login: 5 attempts per 15 minutes */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowSeconds: 15 * 60,
};

/** Register: 3 per hour */
export const REGISTER_RATE_LIMIT: RateLimitConfig = {
  limit: 3,
  windowSeconds: 60 * 60,
};

/** Create order: 5 per hour */
export const CREATE_ORDER_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowSeconds: 60 * 60,
};

/** General API: 60 per minute */
export const GENERAL_RATE_LIMIT: RateLimitConfig = {
  limit: 60,
  windowSeconds: 60,
};