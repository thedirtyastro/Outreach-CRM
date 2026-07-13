"use client";

import { Shield, Menu } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar.store";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  const { open } = useSidebarStore();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-14 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Mobile menu button */}
      <button
        onClick={open}
        className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-semibold truncate">{title}</h1>
          {description && (
            <span className="text-xs text-muted-foreground hidden sm:block truncate">
              {description}
            </span>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/20">
        <Shield className="w-3.5 h-3.5 text-destructive" />
        <span className="text-xs font-medium text-destructive hidden sm:inline">Admin</span>
      </div>
    </header>
  );
}
