"use client";

import { useState, useEffect, useCallback } from "react";
import type { INotification } from "@outreach/shared";

export function useNotifications(pollInterval = 30_000) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.notifications ?? []);
      setUnreadCount(json.unreadCount ?? 0);
    } catch {
      // silent — non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch_();
    if (!pollInterval) return;
    const id = setInterval(() => void fetch_(), pollInterval);
    return () => clearInterval(id);
  }, [fetch_, pollInterval]);

  const markRead = useCallback(async (ids: string[]) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - ids.length));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } catch {
      // revert on failure
      void fetch_();
    }
  }, [fetch_]);

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications?markAll=true", { method: "PATCH" });
    } catch {
      void fetch_();
    }
  }, [fetch_]);

  return { notifications, unreadCount, isLoading, markRead, markAllRead, refresh: fetch_ };
}
