"use client";

import { useRef, useEffect, useState } from "react";
import { Search, SlidersHorizontal, Plus, LayoutGrid, List } from "lucide-react";
import { useLeadsStore } from "@/store/leads.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LeadsToolbarProps {
  onAddLead?: () => void;
}

export function LeadsToolbar({ onAddLead }: LeadsToolbarProps) {
  const { filters, view, setFilters, setView } = useLeadsStore();
  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ search: value || undefined });
    }, 350);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-48 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search leads…"
          className="pl-9"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* View toggle */}
        <div className="flex items-center border border-border rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setView("table")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              view === "table"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              view === "kanban"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Kanban view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Add lead */}
        <Button onClick={onAddLead} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>
    </div>
  );
}
