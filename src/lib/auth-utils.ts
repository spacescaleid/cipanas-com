import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'
import type { Role } from '@prisma/client'

/**
 * Ambil session di server component / server action
 * Return null kalau belum login
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Ambil user yang sedang login
 * Auto redirect ke /login kalau belum login
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }
  return session.user
}

/**
 * Require user dengan role tertentu
 * Auto redirect kalau tidak match
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    // Redirect ke halaman sesuai role user
    if (user.role === 'CONTRIBUTOR') redirect('/dashboard')
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') redirect('/admin')
    redirect('/')
  }
  return user
}

/**
 * Cek apakah user punya role tertentu (untuk logic conditional)
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Cek apakah user adalah admin
 */
export function isAdmin(role: Role): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}