import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Users,
  Megaphone,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/berita", label: "Kelola Berita", icon: Newspaper },
  { href: "/admin/kategori", label: "Kategori", icon: FolderTree },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/iklan", label: "Iklan", icon: Megaphone },
  { href: "/admin/log", label: "Log Aktivitas", icon: Activity },
];