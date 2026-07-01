'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  User as UserIcon,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Settings,
} from 'lucide-react'
import type { SessionUser } from '@/types'

type Props = {
  user: SessionUser
}

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  const isContributor = user.role === 'CONTRIBUTOR'

  // Close dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ambil inisial nama untuk avatar
  const initial = user.nama?.charAt(0).toUpperCase() || 'U'

  const roleLabel = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    CONTRIBUTOR: 'Kontributor',
    VISITOR: 'Pengunjung',
  }[user.role]

  const roleBadgeColor = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    ADMIN:       'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    CONTRIBUTOR: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    VISITOR:     'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }[user.role]

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
          {user.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.foto} alt={user.nama} className="w-full h-full rounded-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg animate-slide-down overflow-hidden">
          {/* Info user */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user.nama}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
            <span
              className={`inline-block mt-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${roleBadgeColor}`}
            >
              {roleLabel}
            </span>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {isAdmin && (
              <MenuLink
                href="/admin"
                icon={<ShieldCheck className="w-4 h-4" />}
                onClick={() => setOpen(false)}
              >
                Panel Admin
              </MenuLink>
            )}

            {(isContributor || isAdmin) && (
              <MenuLink
                href="/dashboard"
                icon={<LayoutDashboard className="w-4 h-4" />}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </MenuLink>
            )}

            <MenuLink
              href={isAdmin ? '/admin' : '/dashboard/profil'}
              icon={<UserIcon className="w-4 h-4" />}
              onClick={() => setOpen(false)}
            >
              Profil Saya
            </MenuLink>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 dark:border-slate-800 py-1.5">
            <button
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable menu link
function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      <span className="text-slate-500 dark:text-slate-400">{icon}</span>
      {children}
    </Link>
  )
}