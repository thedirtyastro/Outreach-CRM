export type GoalSchedule = "today_only" | "daily" | "weekdays" | "custom";

export interface AcquisitionGoal {
  id: string;
  user_id: string;
  date: string;
  target_contacts: number;
  linkedin_target: number;
  twitter_target: number;
  github_target: number;
  instagram_target: number;
  email_target: number;
  calls_target: number;
  meetings_target: number;
  revenue_target: number;
  working_hours: number;
  notes?: string | null;
  schedule: GoalSchedule;
  custom_days?: number[] | null;
  created_at: string;
  updated_at: string;
}
