// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "./prisma";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  LOGIN_RATE_LIMIT,
} from "./rate-limit";

/**
 * Custom error class untuk rate limit di NextAuth authorize().
 * Message-nya akan diteruskan ke halaman /login sebagai query param `?error=<message>`.
 */
class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * NextAuth v4 signature: authorize(credentials, req)
       * req shape: { query, body, headers, method } — plain object, BUKAN Request.
       */
      async authorize(credentials, req) {
        // ─── Rate limit check ──────────────────────────────────────
        // Rate limit per IP (bukan per email). Alasan:
        // - Cegah brute-force password dari 1 IP (5 attempts / 15 menit)
        // - HINDARI account lockout attack: kalau per-email, orang jahat bisa
        //   sengaja input password salah pakai email korban untuk lock akun korban.
        // - Trade-off: 1 IP kena limit setelah 5x gagal untuk akun manapun.
        //   Ini acceptable untuk portal berita — user tidak login berkali-kali.
        const ip = getClientIpFromHeaders(req?.headers);
        const rl = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);

        if (!rl.success) {
          const minutesRemaining = Math.ceil(
            (rl.resetAt - Date.now()) / 60_000
          );
          throw new RateLimitError(
            `Terlalu banyak percobaan login. Coba lagi dalam ${minutesRemaining} menit.`
          );
        }

        // ─── Validasi input dasar — return null tanpa log ──────────
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const email = credentials.email.trim().toLowerCase();
          const password = credentials.password;

          // Cari user
          const user = await prisma.user.findUnique({
            where: { email },
          });

          // User tidak ada — return null tanpa expose (cegah user enumeration)
          if (!user) {
            return null;
          }

          // Verify password
          const passwordValid = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!passwordValid) {
            return null;
          }

          // Sukses
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (err) {
          // Rate limit error harus di-rethrow supaya sampai ke user
          if (err instanceof RateLimitError) {
            throw err;
          }

          // Log error TAK TERDUGA (DB down, dsb) — bukan validation failure
          // Jangan log email/password/hash
          console.error(
            "Auth error (unexpected):",
            err instanceof Error ? err.message : "unknown error"
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: false di production. Ganti ke true HANYA saat debug local, jangan di-commit true.
  debug:
    process.env.NODE_ENV === "development" &&
    process.env.NEXTAUTH_DEBUG === "true",
};