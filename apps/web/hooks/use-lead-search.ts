"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ILead } from "@outreach/shared";

export interface LeadSearchResult {
  id: string;
  name: string;
  company?: string;
  email?: string;
  profileImage?: string;
}

export function useLeadSearch(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LeadSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/leads?search=${encodeURIComponent(query)}&limit=10`,
          { signal: abortRef.current.signal }
        );
        if (!res.ok) return;
        const json = await res.json();
        const leads: ILead[] = json.data?.data ?? [];
        setResults(
          leads.map((l) => ({
            id: l.id,
            name: l.name,
            company: l.company,
            email: l.email,
            profileImage: l.profileImage,
          }))
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  return { query, search, results, isSearching };
}
