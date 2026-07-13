export interface ProductivityStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  completed_days: number;
  last_completed?: string | null;
  created_at: string;
  updated_at: string;
}
