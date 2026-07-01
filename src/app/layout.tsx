import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import SessionProvider from '@/components/providers/SessionProvider'
import { getSession } from '@/lib/auth-utils'
import './globals.css'

// Font untuk body text (sans-serif)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Font untuk judul artikel (serif editorial)
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cipanas.com — Portal Berita Cipanas & Cianjur',
    template: '%s | Cipanas.com',
  },
  description:
    'Portal berita terpercaya seputar Cipanas, Cianjur, dan sekitarnya. Menghadirkan berita terkini, wisata, ekonomi, pendidikan, dan budaya.',
  keywords: ['cipanas', 'cianjur', 'berita cipanas', 'portal berita', 'wisata cipanas'],
  authors: [{ name: 'Cipanas.com' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Cipanas.com',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-readable-light dark:bg-slate-950 dark:text-readable-dark`}
      >
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}