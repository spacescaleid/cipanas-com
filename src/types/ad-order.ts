// src/types/ad-order.ts

import type { AdOrder, AdSlot, User, AdOrderStatus } from "@prisma/client";

export type { AdOrderStatus };

// AdOrder dengan relasi yang sering dipakai
export type AdOrderWithSlot = AdOrder & {
  slot: AdSlot;
};

export type AdOrderWithRelations = AdOrder & {
  slot: AdSlot;
  paymentConfirmedBy: Pick<User, "id" | "name" | "email"> | null;
  reviewedBy: Pick<User, "id" | "name" | "email"> | null;
};

// Label tampilan untuk status
export const AD_STATUS_LABELS: Record<AdOrderStatus, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  AWAITING_CREATIVE: "Menunggu Upload Materi",
  PENDING_REVIEW: "Menunggu Review Admin",
  ACTIVE: "Aktif Tayang",
  REJECTED: "Ditolak",
  EXPIRED: "Kadaluarsa",
};

export const AD_STATUS_COLORS: Record<
  AdOrderStatus,
  { bg: string; text: string; border: string }
> = {
  PENDING_PAYMENT: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  AWAITING_CREATIVE: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  PENDING_REVIEW: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  ACTIVE: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
  },
  REJECTED: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  EXPIRED: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};

// Konfigurasi ukuran iklan per posisi
export const AD_SLOT_CONFIG: Record<
  string, // position string dari AdPosition enum
  {
    label: string;
    sizes: string[];
    maxFileSizeMB: number;
    aspectRatioHint: string;
  }
> = {
  HEADER: {
    label: "Header / Leaderboard",
    sizes: ["728x90", "970x90", "970x250"],
    maxFileSizeMB: 1,
    aspectRatioHint: "Lebar (misal 728×90 atau 970×250)",
  },
  SIDEBAR: {
    label: "Sidebar",
    sizes: ["300x250", "160x600"],
    maxFileSizeMB: 0.5,
    aspectRatioHint: "Kotak atau vertikal (misal 300×250)",
  },
  INLINE: {
    label: "Inline / Tengah Artikel",
    sizes: ["300x250", "336x280"],
    maxFileSizeMB: 0.5,
    aspectRatioHint: "Medium rectangle (misal 300×250)",
  },
  FOOTER: {
    label: "Footer",
    sizes: ["728x90", "320x50"],
    maxFileSizeMB: 0.5,
    aspectRatioHint: "Lebar atau mobile banner",
  },
};

// Paket durasi
export const DURATION_PACKAGES = [
  { value: 7, label: "1 Minggu (7 hari)" },
  { value: 14, label: "2 Minggu (14 hari)" },
  { value: 30, label: "1 Bulan (30 hari)" },
  { value: 90, label: "3 Bulan (90 hari)" },
] as const;

export type DurationDays = (typeof DURATION_PACKAGES)[number]["value"];