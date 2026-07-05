/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // ⭐ YouTube thumbnails
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      // ⚠️ GANTI domain production sebelum deploy
      allowedOrigins: [
        'localhost:3000',
        'cipanas.com',
        'www.cipanas.com',
        // Tambah domain Vercel preview kalau perlu:
        // '*.vercel.app',
      ],
    },
  },
  // 🔒 Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // ═══════════════════════════════════════════════════════════
            // Content-Security-Policy (CSP)
            //
            // ⚠️ TODO(security-hardening): 'unsafe-inline' & 'unsafe-eval'
            // di script-src saat ini masih diizinkan karena Next.js
            // membutuhkannya untuk hydration script & inline event handlers.
            //
            // Migration path (planned): nonce-based CSP dengan middleware
            // yang generate nonce per-request, lalu inject ke <Script nonce={nonce}>.
            //
            // Reference:
            // https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
            //
            // Risk saat ini: LOW
            // - XSS via user content sudah di-mitigate via HTML sanitization
            //   (lihat src/lib/sanitize.ts + src/components/article/ArticleContent.tsx +
            //   src/app/api/articles/route.ts) sebagai defense-in-depth.
            // - CSP di sini masih membantu terhadap:
            //   * script dari domain eksternal (default-src 'self')
            //   * iframe embedding (frame-ancestors 'none')
            //   * mixed content
            //
            // Prioritas migrasi: LOW-MEDIUM
            // (kerjakan setelah Auth.js v5 migration, atau saat scale > 10k user/day)
            // ═══════════════════════════════════════════════════════════
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Nonce-based CSP is the recommended long-term solution.
              // For now, 'unsafe-inline' & 'unsafe-eval' are required by Next.js.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://res.cloudinary.com https://picsum.photos https://images.unsplash.com https://img.youtube.com https://i.ytimg.com",
              "font-src 'self'",
              "connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com",
              // Allow YouTube iframe embed di halaman detail video
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.tiktok.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;