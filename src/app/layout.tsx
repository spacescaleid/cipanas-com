// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cipanas.com — Portal Berita Cipanas",
  description:
    "Portal berita terkini seputar Cipanas: politik, ekonomi, olahraga, hiburan, dan gaya hidup.",
};

// Script inline untuk apply theme sebelum React hydrate (prevent flash)
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('cipanas-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || (prefersDark ? 'dark' : 'light');
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-white font-sans text-readable antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <ThemeProvider>
          <SessionProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { fontSize: "14px" },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}