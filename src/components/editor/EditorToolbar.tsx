// src/components/editor/EditorToolbar.tsx
"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  editor: Editor | null;
  onInsertImage?: () => void;
}

export function EditorToolbar({ editor, onInsertImage }: Props) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      "flex h-8 w-8 items-center justify-center rounded transition",
      active
        ? "bg-brand-600 text-white"
        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
    );

  const handleAddLink = () => {
    const url = window.prompt("URL:");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive("strike"))}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-300 dark:bg-neutral-700" />

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={btn(editor.isActive("heading", { level: 2 }))}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={btn(editor.isActive("heading", { level: 3 }))}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-300 dark:bg-neutral-700" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
        aria-label="Bullet list"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
        aria-label="Ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
        aria-label="Quote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-300 dark:bg-neutral-700" />

      <button
        type="button"
        onClick={handleAddLink}
        className={btn(editor.isActive("link"))}
        aria-label="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      {onInsertImage && (
        <button
          type="button"
          onClick={onInsertImage}
          className={btn(false)}
          aria-label="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      )}

      <div className="mx-1 h-6 w-px bg-neutral-300 dark:bg-neutral-700" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={cn(btn(false), "disabled:opacity-30")}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={cn(btn(false), "disabled:opacity-30")}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
}