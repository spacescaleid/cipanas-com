// src/lib/sanitize.ts

import sanitizeHtml from "sanitize-html";

/**
 * Whitelist tag & atribut yang diizinkan dari Tiptap editor.
 * Semua tag lain (termasuk <script>, <iframe>) akan di-strip.
 * Semua event handler (onerror, onclick, dll) akan dihapus.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    // Heading
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Block
    "p", "br", "hr", "blockquote", "pre", "code",
    // List
    "ul", "ol", "li",
    // Inline
    "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup",
    "a", "span", "mark",
    // Media (dari Tiptap image extension)
    "img", "figure", "figcaption",
    // Table (kalau pakai Tiptap table extension)
    "table", "thead", "tbody", "tr", "th", "td",
    // Misc
    "div",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    span: ["class"],
    div: ["class"],
    code: ["class"], // untuk syntax highlighting
    pre: ["class"],
    "*": ["class"], // allow class di semua tag (untuk styling Tiptap)
  },
  allowedSchemes: ["https", "http", "mailto"], // larang javascript: scheme
  allowedSchemesByTag: {
    a: ["https", "http", "mailto"],
    img: ["https", "http", "data"], // allow data URI untuk gambar inline
  },
  // Hapus tag berbahaya beserta kontennya (bukan cuma strip tag-nya)
  exclusiveFilter: (frame) => {
    return ["script", "style", "iframe", "object", "embed", "form"].includes(
      frame.tag
    );
  },
  // Paksa rel="noopener noreferrer" di semua link external
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || "";
      // Cek apakah link external
      const isExternal =
        href.startsWith("http") && !href.includes("cipanas.com");

      return {
        tagName,
        attribs: {
          ...attribs,
          ...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {}),
        },
      };
    },
  },
};

/**
 * Sanitasi HTML dari konten artikel.
 * Panggil di 2 tempat:
 * 1. Saat simpan artikel ke DB (defense in depth)
 * 2. Saat render di ArticleContent.tsx (pertahanan terakhir)
 */
export function sanitizeArticleHtml(dirtyHtml: string): string {
  return sanitizeHtml(dirtyHtml, SANITIZE_OPTIONS);
}

/**
 * Sanitasi ringan untuk teks biasa (nama, komentar, dsb).
 * Strip SEMUA HTML tag.
 */
export function sanitizeText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}