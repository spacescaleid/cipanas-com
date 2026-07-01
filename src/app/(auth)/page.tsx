import type { Metadata } from 'next'
import Link from 'next/link'
import { Newspaper } from 'lucide-react'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Cipanas.com Anda',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ─── LEFT SIDE: Branding (hanya tampil di desktop) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
        {/* Decorative shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 group w-fit">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/25 transition">
              <Newspaper className="w-6 h-6" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">
              Cipanas<span className="text-brand-200">.com</span>
            </span>
          </Link>

          {/* Tagline */}
          <div className="max-w-md">
            <h2 className="text-4xl font-serif font-bold leading-tight mb-4">
              Portal berita terpercaya seputar Cipanas &amp; Cianjur.
            </h2>
            <p className="text-brand-100 text-lg leading-relaxed">
              Bergabunglah bersama jurnalis lokal untuk menghadirkan informasi
              yang akurat, cepat, dan bermanfaat bagi masyarakat.
            </p>
          </div>

          {/* Footer */}
          <p className="text-sm text-brand-200">
            © {new Date().getFullYear()} Cipanas.com. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Form Login ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo untuk mobile */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                Cipanas<span className="text-brand-600">.com</span>
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Selamat datang kembali
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Masuk untuk mengakses dashboard kontributor atau panel admin.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Demo accounts info */}
          <div className="mt-8 p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Akun Demo
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Admin</span>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                  admin@cipanas.com
                </code>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Kontributor</span>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                  budi@cipanas.com
                </code>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Password</span>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                  password123
                </code>
              </div>
            </div>
          </div>

          {/* Link back */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            <Link
              href="/"
              className="hover:text-brand-600 transition-colors font-medium"
            >
              ← Kembali ke halaman utama
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}