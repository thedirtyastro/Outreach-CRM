export type OutreachPlatform = "linkedin" | "twitter" | "github" | "instagram" | "email" | "website";
export type OutreachType = "connection" | "message" | "email" | "call";
export type OutreachStatus = "sent" | "viewed" | "replied" | "interested";

export interface OutreachLog {
  id: string;
  user_id: string;
  lead_id?: string | null;
  platform: OutreachPlatform;
  contact_name: string;
  company?: string | null;
  outreach_type: OutreachType;
  status: OutreachStatus;
  replied: boolean;
  meeting_booked: boolean;
  proposal_sent: boolean;
  client_won: boolean;
  revenue?: number | null;
  notes?: string | null;
  created_at: string;
}
