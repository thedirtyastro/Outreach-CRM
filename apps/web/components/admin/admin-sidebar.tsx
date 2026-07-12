"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  Settings,
  Shield,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview",    href: "/admin",           icon: LayoutDashboard },
  { label: "Users",       href: "/admin/users",     icon: Users },
  { label: "Analytics",   href: "/admin/analytics", icon: BarChart3 },
  { label: "System",      href: "/admin/system",    icon: Activity },
];

const BOTTOM_ITEMS = [
  { label: "Back to CRM", href: "/dashboard", icon: ArrowLeft },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col bg-sidebar border-r border-sidebar-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-destructive/15 border border-destructive/25">
          <Shield className="w-4 h-4 text-destructive" />
        </div>
        <span className="font-semibold text-sm tracking-tight">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "text-sidebar-primary-foreground bg-sidebar-accent"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              {active && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              )}
              <item.icon
                className={cn(
                  "relative w-4 h-4 shrink-0 transition-colors",
                  active
                    ? "text-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                )}
              />
              <span className="relative">{item.label}</span>
              {active && (
                <ChevronRight className="relative ml-auto w-3.5 h-3.5 text-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 space-y-0.5 border-t border-sidebar-border pt-3">
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-150"
          >
            <item.icon className="w-4 h-4 shrink-0 text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80 transition-colors" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
