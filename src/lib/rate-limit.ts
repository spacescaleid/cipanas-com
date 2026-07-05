// src/lib/rate-limit.ts

/**
 * Simple in-memory rate limiter.
 * Cocok untuk single-instance deployment (Vercel serverless).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

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
  limit: number;
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface CheckRateLimitOptions {
  consume?: boolean;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  options: CheckRateLimitOptions = {}
): RateLimitResult {
  const consume = options.consume !== false;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    if (consume) {
      const resetAt = now + config.windowSeconds * 1000;
      store.set(key, { count: 1, resetAt });
      return { success: true, remaining: config.limit - 1, resetAt };
    }
    return {
      success: true,
      remaining: config.limit,
      resetAt: now + config.windowSeconds * 1000,
    };
  }

  const currentCount = consume ? entry.count + 1 : entry.count;

  if (currentCount > config.limit) {
    if (consume) {
      entry.count = currentCount;
    }
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  if (consume) {
    entry.count = currentCount;
  }

  return {
    success: true,
    remaining: config.limit - currentCount,
    resetAt: entry.resetAt,
  };
}

// ─── IP Parsing Helpers ────────────────────────────────────────────

type HeaderGetter = (key: string) => string | null | undefined;

function parseIpFromHeaderGetter(get: HeaderGetter): string {
  const forwarded = get("x-forwarded-for");
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = get("x-real-ip");
  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp;
  }

  return "unknown";
}

export function getClientIp(request: Request): string {
  return parseIpFromHeaderGetter((key) => request.headers.get(key));
}

export function getClientIpFromNextHeaders(headers: Headers): string {
  return parseIpFromHeaderGetter((key) => headers.get(key));
}

export function getClientIpFromHeaders(
  headers: Record<string, string | string[] | undefined> | undefined
): string {
  if (!headers) return "unknown";

  return parseIpFromHeaderGetter((key) => {
    const value = headers[key] ?? headers[key.toLowerCase()];
    if (Array.isArray(value)) return value[0];
    return value;
  });
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

/** Upload video: 3 per 24 hours per user */
export const UPLOAD_VIDEO_RATE_LIMIT: RateLimitConfig = {
  limit: 3,
  windowSeconds: 24 * 60 * 60,
};

/** Upload gallery image: 20 per hour per user */
export const UPLOAD_GALLERY_RATE_LIMIT: RateLimitConfig = {
  limit: 20,
  windowSeconds: 60 * 60,
};

/** Create comment: 10 per hour per user */
export const CREATE_COMMENT_RATE_LIMIT: RateLimitConfig = {
  limit: 10,
  windowSeconds: 60 * 60,
};

/** General API: 60 per minute */
export const GENERAL_RATE_LIMIT: RateLimitConfig = {
  limit: 60,
  windowSeconds: 60,
};