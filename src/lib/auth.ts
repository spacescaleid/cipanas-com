// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "./prisma";

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
      async authorize(credentials) {
        // 1. Validasi input dasar — return null tanpa log
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const email = credentials.email.trim().toLowerCase();
          const password = credentials.password;

          // 2. Cari user
          const user = await prisma.user.findUnique({
            where: { email },
          });

          // 3. User tidak ada — return null tanpa expose (cegah user enumeration)
          if (!user) {
            return null;
          }

          // 4. Verify password
          const passwordValid = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!passwordValid) {
            return null;
          }

          // 5. Sukses
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (err) {
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
  debug: process.env.NODE_ENV === "development" && process.env.NEXTAUTH_DEBUG === "true",
};