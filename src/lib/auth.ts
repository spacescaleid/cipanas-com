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
    maxAge: 30 * 24 * 60 * 60,
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
        console.log("\n========== LOGIN ATTEMPT ==========");
        console.log("Raw credentials:", JSON.stringify(credentials));

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing email or password");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        console.log("→ Email (normalized):", email);
        console.log("→ Password length:", password.length);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.log("❌ USER NOT FOUND in database for email:", email);

          // Debug: list all users
          const allUsers = await prisma.user.findMany({
            select: { email: true },
          });
          console.log("→ Users yang ada di DB:", allUsers.map((u) => u.email));
          return null;
        }

        console.log("✓ User found:", user.email);
        console.log("✓ Role:", user.role);
        console.log("✓ passwordHash (first 30 chars):", user.passwordHash.substring(0, 30));
        console.log("✓ passwordHash length:", user.passwordHash.length);

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        console.log("→ bcrypt.compare result:", passwordValid);

        if (!passwordValid) {
          console.log("❌ PASSWORD MISMATCH");

          // Debug: coba hash password yang diketik & bandingkan
          const testHash = await bcrypt.hash(password, 12);
          console.log("→ Hash baru dari password yg diketik:", testHash.substring(0, 30));
          console.log("→ (hash beda tiap generate itu normal karena salt)");
          return null;
        }

        console.log("✅ LOGIN SUCCESS");
        console.log("===================================\n");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
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
  debug: true,
};