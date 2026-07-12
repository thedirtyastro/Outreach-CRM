import type { TableName } from "./database.types";

/** Supabase table names — use with supabase.from(TABLES.leads). */
export const TABLES = {
  activities: "activities",
  attachments: "attachments",
  emails: "emails",
  email_events: "email_events",
  follow_ups: "follow_ups",
  leads: "leads",
  meetings: "meetings",
  notes: "notes",
  notifications: "notifications",
  settings: "settings",
  tags: "tags",
  templates: "templates",
  user: "user",
} as const satisfies Record<string, TableName>;
