"use client";

import { Menu } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar.store";

export function MobileHeader() {
  const { open } = useSidebarStore();

  return (
    <div className="sticky top-0 z-30 flex items-center h-12 px-4 bg-background/80 backdrop-blur-md border-b border-border md:hidden">
      <button
        onClick={open}
        className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
}
