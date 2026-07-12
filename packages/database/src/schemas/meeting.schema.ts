export type MeetingType = "call" | "video" | "in_person" | "other";

export interface Meeting {
  id: string;
  user_id: string;
  lead_id: string;
  title: string;
  description?: string | null;
  type: MeetingType;
  start_time: string;
  end_time?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
