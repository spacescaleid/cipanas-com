// src/lib/auth-helpers.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { authOptions } from "./auth";

/** Ambil session di server component / route handler / server action */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Wajib login — redirect ke /login kalau belum */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/** Wajib role tertentu — redirect ke / kalau tidak cocok */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}

/** Cek role dalam route handler / server action (return boolean, tanpa redirect) */
export function hasRole(userRole: Role, allowed: Role[]): boolean {
  return allowed.includes(userRole);
}

/** Landing page tujuan berdasarkan role setelah login */
export function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "CONTRIBUTOR":
      return "/dashboard";
    default:
      return "/";
  }
}