// src/components/editor/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";

import { EditorToolbar } from "./EditorToolbar";

interface Props {
  value: string;
  onChange: (html: string) => void;
  onInsertImage?: () => Promise<string | null>;
  placeholder?: string;
  maxChars?: number;
}

export function TiptapEditor({
  value,
  onChange,
  onInsertImage,
  placeholder = "Tulis berita Anda di sini...",
  maxChars = 20000,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false, // penting untuk SSR Next.js 15+
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxChars,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "article-content prose-editor min-h-[400px] px-4 py-4 focus:outline-none font-serif text-lg leading-relaxed text-neutral-800 dark:text-neutral-200",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync jika value berubah dari luar (misal reset form)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInsertImage = async () => {
    if (!onInsertImage || !editor) return;
    const url = await onInsertImage();
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const charCount = editor?.storage.characterCount.characters() ?? 0;
  const wordCount = editor?.storage.characterCount.words() ?? 0;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <EditorToolbar
        editor={editor}
        onInsertImage={onInsertImage ? handleInsertImage : undefined}
      />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
        <span>
          {wordCount} kata · {charCount}/{maxChars} karakter
        </span>
      </div>
    </div>
  );
}