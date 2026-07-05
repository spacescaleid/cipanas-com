// src/components/editor/FigureNode.ts
import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Custom Tiptap node untuk gambar dengan caption.
 * Output HTML:
 *   <figure class="image-figure my-6">
 *     <img src="..." alt="..." class="rounded-xl w-full" loading="lazy" />
 *     <figcaption class="...">Caption text (editable)</figcaption>
 *   </figure>
 *
 * figcaption bisa diedit langsung di editor.
 * Caption bersifat opsional — kalau kosong, <figcaption> tetap ada tapi tanpa isi.
 *
 * Untuk insert, pakai editor.chain().focus().insertContent({
 *   type: "figure",
 *   attrs: { src, alt },
 *   content: caption ? [{ type: "text", text: caption }] : [],
 * }).run()
 *
 * Sanitize.ts sudah whitelist <figure> dan <figcaption>.
 */
export const FigureNode = Node.create({
  name: "figure",
  group: "block",
  content: "inline*",
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector("img");
          return img?.getAttribute("src") ?? null;
        },
      },
      alt: {
        default: "",
        parseHTML: (element) => {
          const img = element.querySelector("img");
          return img?.getAttribute("alt") ?? "";
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (_node) => {
          if (typeof _node === "string") return false;
          const hasImg = (_node as HTMLElement).querySelector("img");
          return hasImg ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt } = HTMLAttributes;

    return [
      "figure",
      mergeAttributes({ class: "image-figure my-6" }),
      [
        "img",
        {
          src,
          alt: alt || "",
          class: "rounded-xl w-full",
          loading: "lazy",
        },
      ],
      [
        "figcaption",
        {
          class:
            "mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400 italic",
        },
        0,
      ],
    ];
  },
});