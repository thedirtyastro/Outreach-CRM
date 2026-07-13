"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  Mail,
  Kanban,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { useSidebarStore } from "@/store/sidebar.store";

const NAV_ITEMS = [
  { label: "Dashboard",    href: "/dashboard",              icon: LayoutDashboard },
  { label: "Leads",        href: "/dashboard/leads",        icon: Users },
  { label: "Pipeline",     href: "/dashboard/pipeline",     icon: Kanban },
  { label: "Emails",       href: "/dashboard/emails",       icon: Mail },
  { label: "Follow-ups",   href: "/dashboard/followups",    icon: CalendarCheck },
  { label: "Calendar",     href: "/dashboard/calendar",     icon: Calendar },
  { label: "Acquisition",  href: "/dashboard/acquisition",  icon: TrendingUp },
  { label: "Analytics",    href: "/dashboard/analytics",    icon: BarChart3 },
  { label: "Templates",    href: "/dashboard/templates",    icon: FileText },
];

const BOTTOM_ITEMS = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    close();
  }, [pathname, close]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border shrink-0">
        <Logo size="sm" />
        <button
          onClick={close}
          className="md:hidden p-1.5 rounded-lg hover:bg-sidebar-accent/60 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4 text-sidebar-foreground/70" />
        </button>
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
                  layoutId="sidebar-active"
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
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "text-sidebar-foreground bg-sidebar-accent"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  active
                    ? "text-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={close}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-sidebar border-r border-sidebar-border z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
