/**
 * api-key-auth.ts
 *
 * Resolves a user session from either:
 *  1. An active better-auth session cookie (standard browser flow)
 *  2. An X-API-Key header (Chrome extension / external integrations)
 */

import { auth } from "./auth";
import { connectDB } from "@outreach/database/connection";
import { Settings } from "@outreach/database/schemas/settings.schema";

export interface ResolvedUser {
  id: string;
  name: string;
  email: string;
}

export async function resolveUser(
  headers: Headers
): Promise<ResolvedUser | null> {
  // 1. Try standard session cookie first
  const session = await auth.api.getSession({ headers }).catch(() => null);
  if (session?.user) {
    return { id: session.user.id, name: session.user.name, email: session.user.email };
  }

  // 2. Fall back to API key
  const apiKey =
    headers.get("x-api-key") ??
    headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!apiKey) return null;

  await connectDB();
  type PopulatedSettings = { userId: { _id: string; name: string; email: string } };
  const settings = await Settings.findOne({ apiKey })
    .select("userId")
    .populate("userId", "name email")
    .lean() as PopulatedSettings | null;

  if (!settings?.userId) return null;

  const u = settings.userId;
  return { id: String(u._id), name: u.name, email: u.email };
}
