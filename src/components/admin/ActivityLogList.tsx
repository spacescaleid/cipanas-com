// src/components/admin/ActivityLogList.tsx
import Image from "next/image";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";

import { formatRelativeTime, formatDateTime } from "@/lib/format";
import { UserRoleBadge } from "./UserRoleBadge";
import { Pagination } from "@/components/ui/Pagination";
import type { Role } from "@prisma/client";

interface Log {
  id: string;
  action: string;
  target: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: Role;
  };
}

interface Props {
  logs: Log[];
  currentPage: number;
  totalPages: number;
  total: number;
  actions: string[];
  currentAction?: string;
}

const actionMeta: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  APPROVE_ARTICLE: {
    label: "Menyetujui artikel",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    icon: "✓",
  },
  REJECT_ARTICLE: {
    label: "Menolak artikel",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: "✕",
  },
  REQUEST_REVISION: {
    label: "Meminta revisi",
    color:
      "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
    icon: "!",
  },
  UNPUBLISH_ARTICLE: {
    label: "Menurunkan artikel",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    icon: "↓",
  },
  DELETE_ARTICLE: {
    label: "Menghapus artikel",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: "🗑",
  },
  CREATE_CATEGORY: {
    label: "Membuat kategori",
    color:
      "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    icon: "+",
  },
  UPDATE_CATEGORY: {
    label: "Mengubah kategori",
    color:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    icon: "✎",
  },
  DELETE_CATEGORY: {
    label: "Menghapus kategori",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: "🗑",
  },
  CHANGE_USER_ROLE: {
    label: "Mengubah role user",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: "⇅",
  },
  DELETE_USER: {
    label: "Menghapus user",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: "🗑",
  },
  APPROVE_AD: {
    label: "Menyetujui iklan",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    icon: "✓",
  },
  REJECT_AD: {
    label: "Menolak iklan",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: "✕",
  },
  ACTIVATE_AD_ORDER: {
    label: "Mengaktifkan iklan",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    icon: "✓",
  },
  PUBLISH_ARTICLE: {
    label: "Mempublikasikan artikel",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    icon: "✓",
  },
};

function getActionMeta(action: string) {
  return (
    actionMeta[action] ?? {
      label: action.replace(/_/g, " ").toLowerCase(),
      color:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
      icon: "•",
    }
  );
}

export function ActivityLogList({
  logs,
  currentPage,
  totalPages,
  total,
  actions,
  currentAction,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Filter action */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Filter:
        </span>
        <Link
          href="/admin/log"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            !currentAction
              ? "bg-brand-600 text-white"
              : "border border-neutral-200 bg-white text-neutral-700 hover:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          }`}
        >
          Semua
        </Link>
        {actions.map((a) => {
          const meta = getActionMeta(a);
          return (
            <Link
              key={a}
              href={`/admin/log?action=${a}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                currentAction === a
                  ? "bg-brand-600 text-white"
                  : "border border-neutral-200 bg-white text-neutral-700 hover:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {meta.label}
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500">
        Menampilkan halaman {currentPage} dari {totalPages} · Total {total} log
      </p>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-600 dark:text-neutral-400">
            Belum ada aktivitas.
          </p>
        </div>
      ) : (
        <ol className="relative border-l-2 border-neutral-200 pl-6 dark:border-neutral-800">
          {logs.map((log) => {
            const meta = getActionMeta(log.action);
            return (
              <li key={log.id} className="mb-6">
                <div className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-brand-500 dark:border-neutral-950" />

                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-start gap-3">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
                      {log.user.image ? (
                        <Image
                          src={log.user.image}
                          alt={log.user.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UserIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {log.user.name}
                        </span>
                        <UserRoleBadge role={log.user.role} />
                      </div>

                      <div className="mt-1 flex items-start gap-2">
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${meta.color}`}
                        >
                          {meta.icon} {meta.label}
                        </span>
                      </div>

                      <p className="mt-1 break-all font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        {log.target}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        <span>{formatRelativeTime(log.createdAt)}</span>
                        <span>·</span>
                        <span title={formatDateTime(log.createdAt)}>
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={
          currentAction ? `/admin/log?action=${currentAction}` : "/admin/log"
        }
      />
    </div>
  );
}