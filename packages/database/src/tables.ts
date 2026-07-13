import type { TableName } from "./database.types";

/** Supabase table names — use with supabase.from(TABLES.leads). */
export const TABLES = {
  acquisition_goals: "acquisition_goals",
  activities: "activities",
  attachments: "attachments",
  emails: "emails",
  email_events: "email_events",
  follow_ups: "follow_ups",
  leads: "leads",
  meetings: "meetings",
  notes: "notes",
  notifications: "notifications",
  outreach_logs: "outreach_logs",
  productivity_streaks: "productivity_streaks",
  settings: "settings",
  tags: "tags",
  templates: "templates",
  user: "user",
} as const satisfies Record<string, TableName>;
