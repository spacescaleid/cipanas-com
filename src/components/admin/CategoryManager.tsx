// src/components/admin/CategoryManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

interface Props {
  categories: Category[];
}

export function CategoryManager({ categories: initialCategories }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async () => {
    if (newName.trim().length < 2) {
      toast.error("Nama kategori minimal 2 karakter");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        return;
      }
      toast.success("Kategori dibuat");
      setNewName("");
      setCreating(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = async (id: string) => {
    if (editName.trim().length < 2) {
      toast.error("Nama kategori minimal 2 karakter");
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        return;
      }
      toast.success("Kategori diperbarui");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        setDeleting(false);
        return;
      }
      toast.success("Kategori dihapus");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  const deletingCategory = initialCategories.find((c) => c.id === deleteId);

  return (
    <div className="space-y-4">
      {/* Tombol tambah / form input */}
      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      ) : (
        <div className="flex gap-2 rounded-xl border border-brand-500 bg-brand-50/50 p-3 dark:bg-brand-900/20">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Nama kategori baru..."
            autoFocus
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Simpan
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewName("");
            }}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* List kategori */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Nama
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Slug
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Artikel
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950">
            {initialCategories.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-neutral-500"
                >
                  Belum ada kategori. Klik &ldquo;Tambah Kategori&rdquo; untuk
                  memulai.
                </td>
              </tr>
            )}
            {initialCategories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdate(cat.id)
                      }
                      autoFocus
                      className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  ) : (
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {cat.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                  /{cat.slug}
                </td>
                <td className="px-4 py-3 text-center text-sm text-neutral-600 dark:text-neutral-400">
                  {cat.articleCount}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {editingId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdate(cat.id)}
                          disabled={editSaving}
                          className="flex h-8 w-8 items-center justify-center rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                          aria-label="Simpan"
                        >
                          {editSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          aria-label="Batal"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(cat.id)}
                          className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal konfirmasi delete */}
      {deleteId && deletingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
              Hapus Kategori?
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Anda akan menghapus kategori{" "}
              <strong>&ldquo;{deletingCategory.name}&rdquo;</strong>.
              {deletingCategory.articleCount > 0 && (
                <span className="mt-2 block text-red-600">
                  Kategori ini masih memiliki {deletingCategory.articleCount}{" "}
                  artikel. Pindahkan artikel dulu sebelum menghapus.
                </span>
              )}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || deletingCategory.articleCount > 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}