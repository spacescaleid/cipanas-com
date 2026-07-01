// src/app/(public)/kontak/page.tsx
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak — Cipanas.com",
};

const contacts = [
  {
    icon: Mail,
    label: "Email Redaksi",
    value: "redaksi@cipanas.com",
    href: "mailto:redaksi@cipanas.com",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "+62 812-3456-7890",
    href: "tel:+6281234567890",
  },
  {
    icon: MapPin,
    label: "Alamat",
    value: "Jl. Raya Cipanas No. 123, Cianjur, Jawa Barat",
    href: null,
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    value: "Senin – Jumat, 08:00 – 17:00 WIB",
    href: null,
  },
];

export default function KontakPage() {
  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
            Hubungi Kami
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Punya pertanyaan, saran, atau ingin berkolaborasi? Kami siap menerima
            pesan Anda.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {contacts.map((c) => {
            const Icon = c.icon;
            const content = (
              <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-6 transition hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {c.label}
                  </div>
                  <div className="mt-1 text-sm text-neutral-900 dark:text-white">
                    {c.value}
                  </div>
                </div>
              </div>
            );

            return c.href ? (
              <a key={c.label} href={c.href} className="block">
                {content}
              </a>
            ) : (
              <div key={c.label}>{content}</div>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl border-l-4 border-brand-500 bg-brand-50 p-6 text-sm text-neutral-700 dark:bg-brand-900/20 dark:text-neutral-300">
          <strong className="font-semibold text-neutral-900 dark:text-white">
            Ingin memasang iklan?
          </strong>{" "}
          Kunjungi halaman{" "}
          <a
            href="/pasang-iklan"
            className="font-semibold text-brand-700 underline hover:text-brand-800 dark:text-brand-400"
          >
            Pasang Iklan
          </a>{" "}
          untuk informasi paket dan harga.
        </div>
      </div>
    </div>
  );
}