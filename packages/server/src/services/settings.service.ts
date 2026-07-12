/**
 * server/services/settings.service.ts
 */

import crypto from "crypto";
import { supabase } from "@outreach/database/client";
import type { ISettings } from "@outreach/shared";

function rowToSettings(row: Record<string, unknown>): ISettings {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    theme: row.theme as ISettings["theme"],
    notifications: {
      email: row.notif_email as boolean,
      desktop: row.notif_desktop as boolean,
      followUpReminder: row.notif_follow_up_reminder as boolean,
      meetingReminder: row.notif_meeting_reminder as boolean,
    },
    emailSettings: {
      signature: row.email_signature as string | undefined,
      defaultFrom: row.email_default_from as string | undefined,
      trackOpens: row.email_track_opens as boolean,
      trackClicks: row.email_track_clicks as boolean,
    },
    timezone: row.timezone as string,
    apiKey: row.api_key as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const DEFAULT_INSERT = {
  theme: "dark" as const,
  notif_email: true,
  notif_desktop: true,
  notif_follow_up_reminder: true,
  notif_meeting_reminder: true,
  email_track_opens: true,
  email_track_clicks: true,
  timezone: "UTC",
};

export async function getSettings(userId: string): Promise<ISettings> {
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return rowToSettings(data);

  // Create defaults
  const { data: created, error } = await supabase
    .from("settings")
    .insert({ user_id: userId, ...DEFAULT_INSERT })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToSettings(created);
}

export async function updateSettings(userId: string, updates: Partial<ISettings>): Promise<ISettings> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
  if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
  if (updates.notifications) {
    if (updates.notifications.email !== undefined) dbUpdates.notif_email = updates.notifications.email;
    if (updates.notifications.desktop !== undefined) dbUpdates.notif_desktop = updates.notifications.desktop;
    if (updates.notifications.followUpReminder !== undefined) dbUpdates.notif_follow_up_reminder = updates.notifications.followUpReminder;
    if (updates.notifications.meetingReminder !== undefined) dbUpdates.notif_meeting_reminder = updates.notifications.meetingReminder;
  }
  if (updates.emailSettings) {
    if (updates.emailSettings.signature !== undefined) dbUpdates.email_signature = updates.emailSettings.signature;
    if (updates.emailSettings.defaultFrom !== undefined) dbUpdates.email_default_from = updates.emailSettings.defaultFrom;
    if (updates.emailSettings.trackOpens !== undefined) dbUpdates.email_track_opens = updates.emailSettings.trackOpens;
    if (updates.emailSettings.trackClicks !== undefined) dbUpdates.email_track_clicks = updates.emailSettings.trackClicks;
  }

  const { data, error } = await supabase
    .from("settings")
    .upsert({ user_id: userId, ...dbUpdates }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToSettings(data);
}

export async function regenerateApiKey(userId: string): Promise<string> {
  const newKey = `crm_${crypto.randomBytes(24).toString("hex")}`;

  const { error } = await supabase
    .from("settings")
    .upsert({ user_id: userId, api_key: newKey, ...DEFAULT_INSERT }, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
  return newKey;
}
