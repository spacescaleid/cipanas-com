// src/app/api/auth/check-rate-limit/route.ts

import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  LOGIN_RATE_LIMIT,
} from "@/lib/rate-limit";

/**
 * Pre-flight check untuk rate limit login.
 *
 * Dipanggil dari LoginForm SEBELUM `signIn()`, supaya user yang sudah
 * kena limit langsung dapat pesan yang jelas ("Terlalu banyak percobaan,
 * coba lagi X menit") — bukan pesan generik "Email atau password salah"
 * dari NextAuth.
 *
 * PENTING: Menggunakan mode `consume: false` (peek only) — endpoint ini
 * TIDAK ikut menghabiskan jatah rate limit user. Yang meng-konsumsi
 * jatah tetap `authorize()` di NextAuth (gerbang otoritatif).
 *
 * Security notes:
 * - Response hanya berisi status limit berdasarkan IP, tidak ada info
 *   tentang email, user existence, atau data sensitif lain.
 * - Endpoint ini sendiri di-cache no-store (Cache-Control) supaya tidak
 *   di-cache oleh browser/CDN.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);

  // Peek mode — tidak konsumsi jatah user
  const rl = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT, {
    consume: false,
  });

  if (!rl.success) {
    const minutesRemaining = Math.max(
      1,
      Math.ceil((rl.resetAt - Date.now()) / 60_000)
    );

    return NextResponse.json(
      { limited: true, minutesRemaining },
      {
        status: 200, // Tetap 200 karena ini info status, bukan error
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  return NextResponse.json(
    { limited: false },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}