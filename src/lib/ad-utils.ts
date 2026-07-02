// src/lib/ad-utils.ts

import crypto from "crypto";

// ─── Kode Order ─────────────────────────────────────────────────────────────

/**
 * Generate kode order yang mudah dibaca manusia.
 * Format: ADS-YYYYMMDD-XXXX (X = huruf besar + angka, tidak ambiguous)
 * Contoh: ADS-20260702-XK3F
 *
 * Karakter yang dipakai sengaja menghindari: 0/O, 1/I/L untuk mengurangi
 * kebingungan saat dibacakan via WA.
 */
export function generateOrderCode(): string {
  const date = new Date();
  const dateStr = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ""); // YYYYMMDD

  const SAFE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let suffix = "";
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    suffix += SAFE_CHARS[bytes[i] % SAFE_CHARS.length];
  }

  return `ADS-${dateStr}-${suffix}`;
}

// ─── Upload Token ────────────────────────────────────────────────────────────

/**
 * Generate token upload yang aman secara kriptografis.
 * 32 bytes hex = 64 karakter, sangat sulit ditebak.
 * Disimpan as-is di DB, tidak di-hash (karena bukan password,
 * tapi perlu dipertimbangkan hashing jika threat model ketat — lihat catatan di akhir).
 */
export function generateUploadToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Tanggal kedaluwarsa token upload (default 7 hari dari sekarang).
 */
export function getUploadTokenExpiry(days = 7): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

// ─── WhatsApp Link Builder ───────────────────────────────────────────────────

const ADMIN_WA_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER ?? "6281234567890";

/**
 * Buat link wa.me dengan pesan pre-filled.
 * Pastikan nomor dalam format internasional tanpa + (contoh: 6281234567890).
 */
export function buildWhatsAppLink(message: string, number?: string): string {
  const phoneNumber = number ?? ADMIN_WA_NUMBER;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}

/**
 * Pesan konfirmasi pembayaran yang dikirim pengiklan ke admin.
 */
export function buildPaymentConfirmationMessage(params: {
  orderCode: string;
  advertiserName: string;
  businessName: string;
  slotPosition: string;
  totalPrice: number | string;
  startDate: Date | string;
  endDate: Date | string;
}): string {
  const {
    orderCode,
    advertiserName,
    businessName,
    slotPosition,
    totalPrice,
    startDate,
    endDate,
  } = params;

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatPrice = (p: number | string) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(p));

  return `Halo Admin Cipanas.com 👋

Saya ingin mengkonfirmasi pembayaran iklan dengan detail berikut:

📋 *Kode Order:* ${orderCode}
👤 *Nama:* ${advertiserName}
🏢 *Bisnis:* ${businessName}
📍 *Posisi Iklan:* ${slotPosition}
💰 *Total Bayar:* ${formatPrice(totalPrice)}
📅 *Periode:* ${formatDate(startDate)} s/d ${formatDate(endDate)}

Saya telah melakukan transfer sesuai nominal di atas.
Mohon konfirmasi pembayaran saya. Terima kasih! 🙏`;
}

/**
 * Pesan admin ke pengiklan berisi link upload (dikirim manual oleh admin).
 */
export function buildUploadInviteMessage(params: {
  advertiserName: string;
  orderCode: string;
  uploadLink: string;
  tokenExpiresAt: Date;
}): string {
  const { advertiserName, orderCode, uploadLink, tokenExpiresAt } = params;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return `Halo ${advertiserName} 👋

Pembayaran iklan Anda (Kode: *${orderCode}*) telah kami verifikasi ✅

Silakan upload materi iklan Anda melalui link berikut:
🔗 ${uploadLink}

⚠️ Link ini berlaku hingga: *${formatDate(tokenExpiresAt)}*

Jika ada pertanyaan, balas pesan ini. Terima kasih telah beriklan di Cipanas.com! 🙏`;
}

// ─── Format Utilities ────────────────────────────────────────────────────────

export function formatRupiah(amount: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Normalisasi nomor WA Indonesia ke format 628xxxxxxxxxx.
 * Menerima: 08xxx, +628xxx, 628xxx
 */
export function normalizeWhatsAppNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return "62" + digits;
}

/**
 * Hitung harga berdasarkan harga per hari slot dan jumlah hari.
 */
export function calculateTotalPrice(
  pricePerDay: number | string,
  durationDays: number
): number {
  return Number(pricePerDay) * durationDays;
}