export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  lead_id?: string | null;
  link?: string | null;
  created_at: string;
}
