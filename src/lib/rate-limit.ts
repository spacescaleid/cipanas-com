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

// ─── IP Parsing Helpers ────────────────────────────────────────────

/**
 * Type: fungsi getter yang ambil value dari header key.
 * Dipakai untuk unifikasi parsing IP dari berbagai sumber header:
 * - Web API Request.headers (Route Handlers)
 * - Headers instance dari next/headers (Server Actions)
 * - Plain object headers (NextAuth v4 authorize())
 */
type HeaderGetter = (key: string) => string | null | undefined;

/**
 * Core IP parser: ambil IP dari header pakai getter function.
 * Prioritas: x-forwarded-for (bagian pertama) → x-real-ip → "unknown"
 */
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

/**
 * Ambil IP dari Web API Request (untuk Route Handlers /api/*).
 */
export function getClientIp(request: Request): string {
  return parseIpFromHeaderGetter((key) => request.headers.get(key));
}

/**
 * Ambil IP dari Headers instance (untuk Server Actions via next/headers).
 *
 * Contoh pemakaian:
 *   import { headers } from "next/headers";
 *   const h = await headers();
 *   const ip = getClientIpFromNextHeaders(h);
 */
export function getClientIpFromNextHeaders(headers: Headers): string {
  return parseIpFromHeaderGetter((key) => headers.get(key));
}

/**
 * Ambil IP dari plain object headers (untuk NextAuth v4 authorize() req.headers).
 *
 * NextAuth v4 Credentials Provider passing req sebagai plain object dengan
 * shape { query, body, headers, method }, dimana headers adalah plain
 * Record<string, string | string[] | undefined>, BUKAN Headers instance.
 *
 * Contoh pemakaian:
 *   async authorize(credentials, req) {
 *     const ip = getClientIpFromHeaders(req?.headers);
 *   }
 */
export function getClientIpFromHeaders(
  headers: Record<string, string | string[] | undefined> | undefined
): string {
  if (!headers) return "unknown";

  return parseIpFromHeaderGetter((key) => {
    // NextAuth normalisasi header keys ke lowercase, tapi jaga-jaga
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

/** General API: 60 per minute */
export const GENERAL_RATE_LIMIT: RateLimitConfig = {
  limit: 60,
  windowSeconds: 60,
};