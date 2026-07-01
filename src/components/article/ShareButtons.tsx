// src/components/article/ShareButtons.tsx
"use client";

import { Facebook, Twitter, Link2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: Props) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/berita/${slug}`
      : `/berita/${slug}`;

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const links = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-sky-500 hover:text-white",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-green-600 hover:text-white",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="mr-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
        Bagikan:
      </span>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 ${link.color}`}
            aria-label={`Share ke ${link.name}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
      <button
        onClick={handleCopy}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-brand-600 hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        aria-label="Salin link"
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}