"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  BellRing,
  MapPinned,
  LayoutDashboard,
  LogOut,
  PieChart,
  FolderKanban,
  Files,
  Home,
  AlertTriangle,
  Users,
  Compass,
  Map,
  PlusCircle,
  User,
  UserCircle
} from "lucide-react";
import { http } from "@/services/http";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function Sidebar({
  title,
  items,
  homeHref
}: {
  title: string;
  homeHref: string;
  items: Item[];
}) {
  const pathname = usePathname();

  async function onLogout() {
    await http.post("/api/auth/logout");
    window.location.href = "/";
  }

  return (
    <aside className="glass hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[32px] border-2 border-slate-200/50 p-4 shadow-2xl backdrop-blur-2xl dark:border-slate-800/50 md:flex">
      <Link
        href={homeHref}
        className="flex items-center gap-2 rounded-2xl px-3 py-3 transition hover:bg-white/40 dark:hover:bg-slate-900/40"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-teal text-white shadow-soft">
          🌍
        </span>
        <div className="leading-tight">
          <div className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">{title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Smart Civic</div>
        </div>
      </Link>

      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/25 font-black scale-[1.02]"
                  : "text-slate-900 hover:bg-white/40 dark:text-white dark:hover:bg-slate-900/40 hover:text-blue-600 dark:hover:text-blue-400 font-black"
              )}
            >
              <Icon className="size-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-200/40 pt-4 dark:border-slate-800/40">
        <ThemeToggle compact className="w-full justify-center transition-all hover:scale-105" />
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-white hover:text-red-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900 dark:hover:text-red-400"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export const citizenNav = [
  { href: "/portal/citizen", label: "Dashboard", icon: Home },
  { href: "/portal/citizen/report", label: "Report Issue", icon: AlertTriangle },
  { href: "/portal/citizen/my-reports", label: "My Reports", icon: Files },
  { href: "/portal/citizen/map", label: "Map View", icon: MapPinned },
  { href: "/portal/citizen/notifications", label: "Notifications", icon: BellRing },
  { href: "/portal/citizen/profile", label: "Profile", icon: UserCircle }
];

export const adminNav = [
  { href: "/portal/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/admin/reports", label: "Manage Reports", icon: FolderKanban },
  { href: "/portal/admin/map", label: "Map View", icon: MapPinned },
  { href: "/portal/admin/analytics", label: "Analytics", icon: PieChart },
  { href: "/portal/admin/users", label: "Users", icon: Users }
];

