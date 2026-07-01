// src/components/admin/UserRoleBadge.tsx
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  role: Role;
  className?: string;
}

const config: Record<Role, { label: string; className: string }> = {
  VISITOR: {
    label: "Visitor",
    className:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  },
  CONTRIBUTOR: {
    label: "Kontributor",
    className:
      "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  },
  ADMIN: {
    label: "Admin",
    className:
      "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
};

export function UserRoleBadge({ role, className }: Props) {
  const c = config[role];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        c.className,
        className
      )}
    >
      {c.label}
    </span>
  );
}