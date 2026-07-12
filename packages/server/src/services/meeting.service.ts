/**
 * server/services/meeting.service.ts
 */

import { supabase } from "@outreach/database/client";
import { createMeetingSchema } from "@outreach/shared/validations";
import type { IMeeting } from "@outreach/shared";

function rowToMeeting(row: Record<string, unknown>): IMeeting {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    leadId: row.lead_id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    type: row.type as IMeeting["type"],
    startTime: row.start_time as string,
    endTime: row.end_time as string | undefined,
    location: row.location as string | undefined,
    meetingUrl: row.meeting_url as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export interface ListMeetingsOptions {
  userId: string;
  leadId?: string;
  start?: string;
  end?: string;
}

export async function listMeetings(options: ListMeetingsOptions): Promise<IMeeting[]> {
  const { userId, leadId, start, end } = options;

  let query = supabase
    .from("meetings")
    .select("*, lead:leads(id,name,company,email,profile_image)")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  if (leadId) query = query.eq("lead_id", leadId);
  if (start) query = query.gte("start_time", start);
  if (end) query = query.lte("start_time", end);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(rowToMeeting);
}

export async function createMeeting(
  userId: string,
  input: unknown
): Promise<{ meeting: IMeeting | null; validationError: string | null }> {
  const parsed = createMeetingSchema.safeParse(input);
  if (!parsed.success) {
    return { meeting: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      user_id: userId,
      lead_id: parsed.data.leadId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      type: parsed.data.type,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime ?? null,
      location: parsed.data.location ?? null,
      meeting_url: parsed.data.meetingUrl ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("activities").insert({
    user_id: userId,
    lead_id: parsed.data.leadId,
    type: "meeting_added",
    description: `Meeting scheduled: ${parsed.data.title}`,
    icon: "Calendar",
    metadata: { meetingId: data.id },
  });

  return { meeting: rowToMeeting(data), validationError: null };
}

export async function updateMeeting(
  id: string,
  userId: string,
  updates: Record<string, unknown>
): Promise<IMeeting | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
  if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.meetingUrl !== undefined) dbUpdates.meeting_url = updates.meetingUrl;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  // also handle snake_case from route handlers
  if (updates.start_time !== undefined) dbUpdates.start_time = updates.start_time;
  if (updates.end_time !== undefined) dbUpdates.end_time = updates.end_time;
  if (updates.meeting_url !== undefined) dbUpdates.meeting_url = updates.meeting_url;

  const { data, error } = await supabase
    .from("meetings")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? rowToMeeting(data) : null;
}

export async function deleteMeeting(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("meetings")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
