// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@prisma/client";

const CONTRIBUTOR_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];

const ADMIN_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];
const CONTRIBUTOR_ROLES: Role[] = ["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"];

function pathStartsWith(pathname: string, routes: string[]): boolean {
  return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as Role | undefined;

  // ── 1. Kalau sudah login tapi akses /login atau /register → redirect sesuai role
  if (isAuthenticated && pathStartsWith(pathname, AUTH_ROUTES)) {
    const target =
      userRole && ADMIN_ROLES.includes(userRole)
        ? "/admin"
        : userRole === "CONTRIBUTOR"
        ? "/dashboard"
        : "/";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // ── 2. Proteksi /admin/*
  if (pathStartsWith(pathname, ADMIN_ROUTES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── 3. Proteksi /dashboard/*
  if (pathStartsWith(pathname, CONTRIBUTOR_ROUTES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!userRole || !CONTRIBUTOR_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};