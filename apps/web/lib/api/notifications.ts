/**
 * lib/api/notifications.ts
 *
 * Frontend API client for notification endpoints.
 */

import { apiClient } from "./client";
import type { INotification } from "@outreach/shared";

export const notificationsApi = {
  list: (params?: { unread?: boolean }) =>
    apiClient.get<{ notifications: INotification[]; unreadCount: number }>(
      "/api/notifications",
      params
    ),

  markRead: (ids: string[]) =>
    apiClient.patch<{ success: boolean }>("/api/notifications", { ids }),

  markAllRead: () =>
    fetch("/api/notifications?markAll=true", { method: "PATCH" }).then((r) => r.json()),
};
