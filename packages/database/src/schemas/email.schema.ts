export type EmailStatus = "draft" | "sent" | "failed";

export interface Email {
  id: string;
  user_id: string;
  lead_id: string;
  message_id?: string | null;
  subject: string;
  body: string;
  html?: string | null;
  from: string;
  to: string;
  status: EmailStatus;
  thread_id?: string | null;
  attachments: string[];
  opened_at?: string | null;
  clicked_at?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type EmailEventType = "delivered" | "opened" | "clicked" | "bounced" | "complained" | "replied";

export interface EmailEvent {
  id: string;
  email_id: string;
  lead_id: string;
  type: EmailEventType;
  data?: Record<string, unknown> | null;
  created_at: string;
}
