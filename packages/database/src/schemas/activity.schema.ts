export type ActivityType =
  | "lead_created"
  | "lead_updated"
  | "email_sent"
  | "email_opened"
  | "email_clicked"
  | "meeting_added"
  | "call_logged"
  | "note_added"
  | "proposal_uploaded"
  | "project_won"
  | "project_lost"
  | "status_changed"
  | "follow_up_created"
  | "follow_up_completed"
  | "attachment_added";

export interface Activity {
  id: string;
  user_id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  icon?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}
