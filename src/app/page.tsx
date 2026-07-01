import Link from 'next/link'
import { getSession } from '@/lib/auth-utils'

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
          Cipanas<span className="text-brand-600">.com</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Portal berita terpercaya seputar Cipanas & Cianjur
        </p>

        {session?.user ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Anda login sebagai <strong>{session.user.name}</strong> ({session.user.role})
            </p>
            <div className="flex gap-3 justify-center">
              {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                <Link
                  href="/admin"
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                >
                  Panel Admin
                </Link>
              )}
              {session.user.role === 'CONTRIBUTOR' && (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium"
          >
            Masuk ke Akun
          </Link>
        )}

        <p className="mt-12 text-xs text-slate-400">
          🚧 Situs publik lengkap akan dibangun di <strong>Tahap 2 (lanjutan)</strong>.
        </p>
      </div>
    </div>
  )
}