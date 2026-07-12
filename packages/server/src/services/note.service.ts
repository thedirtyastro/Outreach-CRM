/**
 * server/services/note.service.ts
 */

import { supabase } from "@outreach/database/client";
import { createNoteSchema } from "@outreach/shared/validations";
import type { INote } from "@outreach/shared";

function rowToNote(row: Record<string, unknown>): INote {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    leadId: row.lead_id as string,
    content: row.content as string,
    isPinned: row.is_pinned as boolean,
    attachments: (row.attachments as string[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listNotes(userId: string, leadId?: string): Promise<INote[]> {
  let query = supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (leadId) query = query.eq("lead_id", leadId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToNote);
}

export async function createNote(
  userId: string,
  input: unknown
): Promise<{ note: INote | null; validationError: string | null }> {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { note: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      lead_id: parsed.data.leadId,
      content: parsed.data.content,
      is_pinned: parsed.data.isPinned,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("activities").insert({
    user_id: userId,
    lead_id: parsed.data.leadId,
    type: "note_added",
    description: "Note added",
    icon: "FileText",
    metadata: { noteId: data.id },
  });

  return { note: rowToNote(data), validationError: null };
}

export async function updateNote(
  id: string,
  userId: string,
  updates: Partial<{ content: string; isPinned: boolean; attachments: string[] }>
): Promise<INote | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
  if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;

  const { data, error } = await supabase
    .from("notes")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? rowToNote(data) : null;
}

export async function deleteNote(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("notes")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
