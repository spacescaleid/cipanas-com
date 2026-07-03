// src/app/robots.ts
import type { MetadataRoute } from "next";

/**
 * Dynamic robots.txt generator (Next.js App Router).
 * Otomatis menggunakan NEXT_PUBLIC_APP_URL untuk sitemap URL.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cipanas.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/login",
          "/register",
          "/upload-iklan/",
          "/cek-status/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}