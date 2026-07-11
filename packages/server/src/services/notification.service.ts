/**
 * server/services/notification.service.ts
 *
 * Database operations for the Notification entity.
 */

import { connectDB } from "@outreach/database";
import { Notification } from "@outreach/database/schemas/notification.schema";
import type { INotification } from "@outreach/shared";

/** Fetch recent notifications and the unread count for a user. */
export async function getNotifications(
  userId: string,
  unreadOnly = false
): Promise<{ notifications: INotification[]; unreadCount: number }> {
  await connectDB();

  const filter: Record<string, unknown> = { userId };
  if (unreadOnly) filter.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications: notifications as unknown as INotification[],
    unreadCount,
  };
}

/** Mark specific notification ids as read. */
export async function markNotificationsRead(
  userId: string,
  ids: string[]
): Promise<void> {
  await connectDB();
  await Notification.updateMany(
    { _id: { $in: ids }, userId },
    { $set: { isRead: true } }
  );
}

/** Mark all notifications as read for a user. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await connectDB();
  await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );
}

/** Create a notification (internal use — e.g. from cron or webhook handlers). */
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
  await connectDB();
  const notification = await Notification.create({ userId, ...data });
  return notification.toObject() as unknown as INotification;
}
