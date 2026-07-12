export type FollowUpStatus = "pending" | "completed" | "overdue" | "cancelled";
export type RecurringUnit = "days" | "weeks" | "months";

export interface FollowUp {
  id: string;
  user_id: string;
  lead_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  status: FollowUpStatus;
  is_recurring: boolean;
  recurring_interval?: number | null;
  recurring_unit?: RecurringUnit | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}
