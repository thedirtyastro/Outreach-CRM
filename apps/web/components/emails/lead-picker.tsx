"use client";

import { useRef, useState, useEffect } from "react";
import { Search, X, Loader2, User } from "lucide-react";
import { useLeadSearch, type LeadSearchResult } from "@/hooks/use-lead-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeadPickerProps {
  value: string; // selected leadId
  onChange: (id: string, lead?: LeadSearchResult) => void;
  placeholder?: string;
  className?: string;
  /** Pre-filled label when a leadId is passed from outside (e.g., defaultLeadId) */
  initialLabel?: string;
}

export function LeadPicker({
  value,
  onChange,
  placeholder = "Search lead by name or email…",
  className,
  initialLabel,
}: LeadPickerProps) {
  const { query, search, results, isSearching } = useLeadSearch();
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>(initialLabel ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    search(q);
    setOpen(true);
    if (!q) {
      onChange("", undefined);
      setSelectedLabel("");
    }
  }

  function handleSelect(lead: LeadSearchResult) {
    onChange(lead._id, lead);
    setSelectedLabel(`${lead.name}${lead.company ? ` · ${lead.company}` : ""}`);
    setOpen(false);
    search(""); // clear internal query
  }

  function handleClear() {
    onChange("", undefined);
    setSelectedLabel("");
    search("");
    setOpen(false);
    inputRef.current?.focus();
  }

  // Show search input when no lead selected, or show selected state
  const isSelected = Boolean(value);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {isSelected ? (
        // Selected state — pill display
        <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm">
          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="flex-1 truncate">{selectedLabel || value}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        // Search input
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (query) setOpen(true); }}
            placeholder={placeholder}
            className="w-full h-9 pl-9 pr-9 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      )}

      {/* Dropdown */}
      {open && !isSelected && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden">
          {results.length === 0 && query.length > 0 && !isSearching ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No leads found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul role="listbox" className="max-h-52 overflow-y-auto">
              {results.map((lead) => (
                <li key={lead._id}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => handleSelect(lead)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-sm transition-colors"
                  >
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={lead.profileImage} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {lead.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-left">
                      <p className="font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[lead.company, lead.email].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
