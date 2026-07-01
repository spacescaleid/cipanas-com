import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Newspaper, TrendingUp, Users, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* ─── HERO ────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Portal Berita Terpercaya
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Cipanas<span className="text-brand-600">.com</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Menghadirkan berita terkini seputar Cipanas, Cianjur, dan sekitarnya —
              dari wisata, ekonomi, pendidikan, hingga budaya.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/kategori/wisata"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition shadow-sm"
              >
                Jelajahi Berita
              </Link>
              <Link
                href="/pasang-iklan"
                className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition"
              >
                Pasang Iklan
              </Link>
            </div>
          </div>

          {/* Info cards */}
          <div className="mt-20 grid sm:grid-cols-3 gap-6">
            <InfoCard
              icon={<Newspaper className="w-6 h-6" />}
              title="Berita Aktual"
              description="Update berita terbaru setiap hari dari berbagai kategori"
            />
            <InfoCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Terpopuler"
              description="Widget berita paling banyak dibaca di sidebar"
            />
            <InfoCard
              icon={<Users className="w-6 h-6" />}
              title="Kontributor Lokal"
              description="Jurnalis lokal yang meliput langsung dari Cipanas"
            />
          </div>

          {/* Note tahap */}
          <div className="mt-16 max-w-2xl mx-auto text-center">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                🚧 <strong>Sedang dibangun:</strong> Halaman beranda lengkap dengan
                hero berita utama, grid artikel, widget populer, dan slot iklan akan
                tersedia di <strong>Tahap 3</strong>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-card-hover transition-all">
      <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}