/**
 * server/services/settings.service.ts
 *
 * Database operations for the Settings entity and API key management.
 */

import crypto from "crypto";
import { connectDB } from "@outreach/database";
import { Settings } from "@outreach/database/schemas/settings.schema";
import type { ISettings } from "@outreach/shared";

const DEFAULT_SETTINGS = {
  theme: "dark" as const,
  notifications: {
    email: true,
    desktop: true,
    followUpReminder: true,
    meetingReminder: true,
  },
  emailSettings: {
    trackOpens: true,
    trackClicks: true,
  },
  timezone: "UTC",
};

/** Get settings for a user. Creates default settings if they don't exist yet. */
export async function getSettings(userId: string): Promise<ISettings> {
  await connectDB();

  let settings = await Settings.findOne({ userId }).lean();
  if (!settings) {
    settings = await Settings.create({ userId, ...DEFAULT_SETTINGS });
  }

  return settings as unknown as ISettings;
}

/** Update settings for a user. */
export async function updateSettings(
  userId: string,
  updates: Partial<ISettings>
): Promise<ISettings> {
  await connectDB();

  const settings = await Settings.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  );

  return settings.toObject() as unknown as ISettings;
}

/** Generate or regenerate the API key for a user. Returns the new key. */
export async function regenerateApiKey(userId: string): Promise<string> {
  await connectDB();

  const newKey = `crm_${crypto.randomBytes(24).toString("hex")}`;

  await Settings.findOneAndUpdate(
    { userId },
    { $set: { apiKey: newKey } },
    { upsert: true }
  );

  return newKey;
}
