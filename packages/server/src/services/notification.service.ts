/**
 * server/services/notification.service.ts
 */

import { supabase } from "@outreach/database/client";
import type { INotification } from "@outreach/shared";

function rowToNotification(row: Record<string, unknown>): INotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    message: row.message as string,
    type: row.type as INotification["type"],
    isRead: row.is_read as boolean,
    leadId: row.lead_id as string | undefined,
    link: row.link as string | undefined,
    createdAt: row.created_at as string,
  };
}

export async function getNotifications(
  userId: string,
  unreadOnly = false
): Promise<{ notifications: INotification[]; unreadCount: number }> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (unreadOnly) query = query.eq("is_read", false);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return {
    notifications: (data ?? []).map(rowToNotification),
    unreadCount: count ?? 0,
  };
}

export async function markNotificationsRead(userId: string, ids: string[]): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", ids)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
}

export async function createNotification(
  userId: string,
  data: {
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
    leadId?: string;
    link?: string;
  }
): Promise<INotification> {
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: data.title,
      message: data.message,
      type: data.type ?? "info",
      lead_id: data.leadId ?? null,
      link: data.link ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToNotification(notification);
}
