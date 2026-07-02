// src/components/admin/UserManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User as UserIcon,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import type { Role } from "@prisma/client";
import toast from "react-hot-toast";

import { UserRoleBadge } from "./UserRoleBadge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  bio: string | null;
  createdAt: Date;
  _count: { articles: number };
}

interface Props {
  users: User[];
  counts: Record<string, number>;
  currentUserId: string;
  currentUserRole: Role;
}

type FilterKey = "ALL" | Role;

const ROLES: Role[] = ["VISITOR", "CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"];

const filters: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "SUPER_ADMIN", label: "Super Admin" },
  { key: "ADMIN", label: "Admin" },
  { key: "CONTRIBUTOR", label: "Kontributor" },
  { key: "VISITOR", label: "Visitor" },
];

export function UserManager({
  users,
  counts,
  currentUserId,
  currentUserRole,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");

  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const filtered = users.filter((u) => {
    if (filter !== "ALL" && u.role !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setChangingRoleId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        return;
      }
      toast.success(`Role diubah menjadi ${newRole}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setChangingRoleId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Gagal");
        setProcessing(false);
        return;
      }
      toast.success("User dihapus");
      setDeleteUserId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  const canChangeRole = (target: User): boolean => {
    if (target.id === currentUserId) return false;
    if (currentUserRole === "SUPER_ADMIN") return true;
    // ADMIN hanya boleh ubah VISITOR ↔ CONTRIBUTOR
    if (currentUserRole === "ADMIN") {
      return target.role === "VISITOR" || target.role === "CONTRIBUTOR";
    }
    return false;
  };

  const availableRoles = (_target: User): Role[] => {
    if (currentUserRole === "SUPER_ADMIN") return ROLES;
    // ADMIN cuma bisa toggle VISITOR ↔ CONTRIBUTOR
    return ["VISITOR", "CONTRIBUTOR"];
  };

  const canDelete = (target: User): boolean => {
    if (target.id === currentUserId) return false;
    return currentUserRole === "SUPER_ADMIN";
  };

  const deletingUser = users.find((u) => u.id === deleteUserId);

  return (
    <div className="space-y-4">
      {/* Filter + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = filter === f.key;
            const count = counts[f.key] ?? 0;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-bold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama/email..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Role
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Artikel
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Bergabung
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-neutral-500"
                >
                  Tidak ada user yang cocok.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
                        {u.image ? (
                          <Image
                            src={u.image}
                            alt={u.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UserIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-neutral-900 dark:text-white">
                          {u.name}
                          {u.id === currentUserId && (
                            <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-normal text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-neutral-500">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canChangeRole(u) ? (
                      <select
                        value={u.role}
                        disabled={changingRoleId === u.id}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as Role)
                        }
                        className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      >
                        {availableRoles(u).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <UserRoleBadge role={u.role} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-neutral-600 dark:text-neutral-400">
                    {u._count.articles}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {canDelete(u) && (
                        <button
                          type="button"
                          onClick={() => setDeleteUserId(u.id)}
                          className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label="Hapus user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Note untuk ADMIN biasa */}
      {currentUserRole === "ADMIN" && (
        <p className="text-xs text-neutral-500">
          Sebagai <strong>Admin</strong>, Anda hanya dapat mengubah role antara
          Visitor dan Kontributor. Hanya <strong>Super Admin</strong> yang dapat
          mempromosikan user menjadi Admin atau menghapus akun.
        </p>
      )}

      {/* Modal delete */}
      {deleteUserId && deletingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
          onClick={() => !processing && setDeleteUserId(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
              Hapus User?
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Anda akan menghapus akun{" "}
              <strong>&ldquo;{deletingUser.name}&rdquo;</strong> beserta{" "}
              <strong>{deletingUser._count.articles} artikel</strong> yang
              ditulis oleh user ini.
              <span className="mt-2 block font-semibold text-red-600">
                Tindakan ini TIDAK dapat dibatalkan.
              </span>
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteUserId(null)}
                disabled={processing}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={processing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}