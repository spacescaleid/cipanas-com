// src/components/ui/CopyButton.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700 transition-colors"
    >
      {copied ? "✓ Tersalin" : label}
    </button>
  );
}