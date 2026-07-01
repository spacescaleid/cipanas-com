// src/app/(public)/pasang-iklan/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Check, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pasang Iklan — Cipanas.com",
  description: "Promosikan bisnis Anda di portal berita terpercaya Cipanas.com",
};

export const revalidate = 300;

async function getAdSlots() {
  return prisma.adSlot.findMany({
    orderBy: { pricePerDay: "desc" },
  });
}

const benefits = [
  "Audiens lokal Cipanas & Cianjur yang tertarget",
  "Traffic organik ribuan pembaca per hari",
  "Statistik performa iklan real-time",
  "Support pemasangan cepat & profesional",
];

export default async function PasangIklanPage() {
  const slots = await getAdSlots();

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Hero */}
        <div className="mb-16 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-brand-600 dark:text-brand-400" />
          <h1 className="mt-6 font-serif text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
            Pasang Iklan di Cipanas.com
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Jangkau ribuan pembaca lokal Cipanas dan sekitarnya. Berbagai paket
            iklan tersedia untuk setiap kebutuhan bisnis Anda.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-16 grid gap-3 sm:grid-cols-2">
          {benefits.map((b) => (
            <div
              key={b}
              className="flex items-start gap-3 rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {b}
              </span>
            </div>
          ))}
        </div>

        {/* Paket */}
        <div>
          <h2 className="mb-8 text-center font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Paket Iklan Tersedia
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col rounded-xl border-2 border-neutral-200 bg-white p-6 transition hover:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {slot.position}
                  </div>
                  <div className="mt-2 font-mono text-sm text-neutral-500">
                    {slot.size}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
                    {formatRupiah(Number(slot.pricePerDay))}
                  </div>
                  <div className="text-xs text-neutral-500">per hari</div>
                </div>

                <Link
                  href={`/pasang-iklan/order?slot=${slot.id}`}
                  className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Pesan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Info tambahan */}
        <div className="mt-16 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
            Butuh Paket Khusus?
          </h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Kami juga menerima kerja sama iklan native, sponsored article, dan
            paket promosi jangka panjang dengan harga khusus.
          </p>
          <Link
            href="/kontak"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Hubungi tim iklan kami <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
          Form pemesanan & integrasi pembayaran akan aktif di Tahap 6.
        </div>
      </div>
    </div>
  );
}