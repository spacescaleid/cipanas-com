'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Newspaper, Menu, X, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { UserMenu } from './UserMenu'

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Pemerintahan', href: '/kategori/pemerintahan' },
  { label: 'Ekonomi', href: '/kategori/ekonomi' },
  { label: 'Wisata', href: '/kategori/wisata' },
  { label: 'Olahraga', href: '/kategori/olahraga' },
  { label: 'Video', href: '/video' },
]

export default function Navbar() {
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLoading = status === 'loading'

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ─── LOGO ────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-serif font-bold text-slate-900 dark:text-white hidden sm:block">
              Cipanas<span className="text-brand-600">.com</span>
            </span>
          </Link>

          {/* ─── DESKTOP MENU ───────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ─── RIGHT SIDE ─────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <Link
              href="/cari"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label="Cari"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* AUTH: Login button OR User menu */}
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : session?.user ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 rounded-lg transition shadow-sm"
              >
                Masuk
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ─── MOBILE MENU ─────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 py-3 animate-slide-down">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition"
                >
                  {link.label}
                </Link>
              ))}
              {!session?.user && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 mx-3 px-4 py-2.5 text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 rounded-lg transition text-center"
                >
                  Masuk ke Akun
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}