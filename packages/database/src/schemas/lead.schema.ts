export type LeadStatus =
  | "new"
  | "initiated"
  | "message_sent"
  | "viewed"
  | "responded"
  | "interested"
  | "meeting_scheduled"
  | "proposal_sent"
  | "negotiation"
  | "waiting"
  | "won"
  | "lost"
  | "ghosted"
  | "rejected"
  | "archived";

export type LeadPriority = "low" | "medium" | "high" | "urgent";
export type LeadPlatform =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "github"
  | "website"
  | "referral"
  | "email"
  | "other";
export type LeadResponse = "positive" | "negative" | "neutral" | "none";
export type ProjectType =
  | "web_development"
  | "mobile_app"
  | "design"
  | "consulting"
  | "maintenance"
  | "seo"
  | "marketing"
  | "other";

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  company?: string | null;
  designation?: string | null;
  industry?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  github?: string | null;
  portfolio?: string | null;
  location?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  tags: string[];
  priority: LeadPriority;
  status: LeadStatus;
  platform: LeadPlatform;
  response: LeadResponse;
  budget?: number | null;
  expected_revenue?: number | null;
  project_type?: ProjectType | null;
  last_contact?: string | null;
  next_follow_up?: string | null;
  score?: number | null;
  is_archived: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}
