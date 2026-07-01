// src/app/(public)/tentang/page.tsx
import type { Metadata } from "next";
import { Newspaper, Users, Target, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami — Cipanas.com",
  description: "Mengenal lebih dekat portal berita Cipanas.com",
};

const values = [
  {
    icon: Newspaper,
    title: "Akurat & Terpercaya",
    description:
      "Setiap berita melalui proses verifikasi ketat sebelum dipublikasikan.",
  },
  {
    icon: Users,
    title: "Untuk Warga",
    description:
      "Fokus pada isu-isu yang relevan dengan kehidupan warga Cipanas dan sekitarnya.",
  },
  {
    icon: Target,
    title: "Independen",
    description:
      "Bebas dari kepentingan politik dan bisnis tertentu dalam pemberitaan.",
  },
  {
    icon: Award,
    title: "Berkualitas",
    description:
      "Tim redaksi berpengalaman menyajikan konten berkualitas tinggi.",
  },
];

export default function TentangPage() {
  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-white md:text-5xl">
            Tentang Cipanas.com
          </h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            Portal berita terpercaya untuk warga Cipanas dan sekitarnya
          </p>
        </div>

        <div className="prose-lg space-y-6 text-neutral-700 dark:text-neutral-300">
          <p className="font-serif text-lg leading-relaxed">
            <strong>Cipanas.com</strong> hadir sebagai portal berita digital yang
            fokus pada penyampaian informasi terkini, akurat, dan relevan untuk
            masyarakat Cipanas, Cianjur, dan sekitarnya. Kami hadir untuk mengisi
            kebutuhan informasi lokal yang berkualitas di era digital.
          </p>

          <p className="font-serif text-lg leading-relaxed">
            Berdiri dengan semangat jurnalisme independen, redaksi Cipanas.com
            berkomitmen menyajikan pemberitaan yang berimbang, mendalam, dan
            bermanfaat bagi pembaca. Kami meliput berbagai isu — mulai dari
            politik, ekonomi, olahraga, hingga hiburan dan gaya hidup.
          </p>
        </div>

        {/* Nilai-Nilai */}
        <div className="mt-16">
          <h2 className="mb-8 text-center font-serif text-3xl font-bold text-neutral-900 dark:text-white">
            Nilai Kami
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <Icon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                  <h3 className="mt-4 font-serif text-lg font-bold text-neutral-900 dark:text-white">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-center text-white md:p-12">
          <h2 className="font-serif text-2xl font-bold md:text-3xl">
            Bergabung Menjadi Kontributor
          </h2>
          <p className="mt-3 text-brand-100">
            Punya berita atau opini yang ingin dibagikan? Daftar sekarang!
          </p>
          <a
            href="/register"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}