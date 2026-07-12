/**
 * server/services/tag.service.ts
 */

import { supabase } from "@outreach/database/client";
import type { ITag } from "@outreach/shared";

function rowToTag(row: Record<string, unknown>): ITag {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    color: row.color as string,
    createdAt: row.created_at as string,
  };
}

export async function listTags(userId: string): Promise<ITag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToTag);
}

export async function createTag(userId: string, name: string, color = "#6366f1"): Promise<ITag | null> {
  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (existing) return null;

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: userId, name, color })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToTag(data);
}

export async function updateTag(
  id: string,
  userId: string,
  updates: Partial<{ name: string; color: string }>
): Promise<ITag | null> {
  const { data, error } = await supabase
    .from("tags")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? rowToTag(data) : null;
}

export async function deleteTag(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("tags")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
