/**
 * api-key-auth.ts
 *
 * Resolves a user session from either:
 *  1. An active better-auth session cookie (standard browser flow)
 *  2. An X-API-Key header (Chrome extension / external integrations)
 */

import { auth } from "./auth";
import { supabase } from "@outreach/database/client";

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

  // 2. Fall back to API key header
  const apiKey =
    headers.get("x-api-key") ??
    headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!apiKey) return null;

  // Look up the settings row to find the user_id
  const { data: settings } = await supabase
    .from("settings")
    .select("user_id")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (!settings?.user_id) return null;

  // Fetch the user from better-auth's "user" table
  const { data: user } = await supabase
    .from("user")
    .select("id, name, email")
    .eq("id", settings.user_id)
    .maybeSingle();

  if (!user) return null;

  return { id: user.id, name: user.name, email: user.email };
}
