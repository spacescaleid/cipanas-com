import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-serif font-bold text-brand-600 dark:text-brand-400">
            404
          </h1>
        </div>

        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <Link
            href="/cari"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition"
          >
            <Search className="w-4 h-4" />
            Cari Berita
          </Link>
        </div>
      </div>
    </div>
  )
}