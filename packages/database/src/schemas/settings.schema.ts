export type Theme = "dark" | "light" | "system";

/** Flat column shape matching the Supabase `settings` table. */
export interface Settings {
  id: string;
  user_id: string;
  theme: Theme;
  notif_email: boolean;
  notif_desktop: boolean;
  notif_follow_up_reminder: boolean;
  notif_meeting_reminder: boolean;
  email_signature?: string | null;
  email_default_from?: string | null;
  email_track_opens: boolean;
  email_track_clicks: boolean;
  timezone: string;
  api_key?: string | null;
  created_at: string;
  updated_at: string;
}
