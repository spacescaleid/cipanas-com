// src/app/layout.tsx

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cipanas.com — Portal Berita Cipanas",
    template: "%s | Cipanas.com",
  },
  description: "Portal berita terkini seputar Cipanas dan sekitarnya",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session di server untuk avoid loading flash
  const session = await getServerSession(authOptions);

  // Baca theme dari cookie
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  const isDark = theme === "dark";

  return (
    <html
      lang="id"
      className={isDark ? "dark" : ""}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-sans text-readable antialiased dark:bg-neutral-950">
        <AuthProvider session={session}>
          <ThemeProvider initialTheme={isDark ? "dark" : "light"}>
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}