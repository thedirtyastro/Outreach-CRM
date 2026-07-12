/**
 * server/services/followup.service.ts
 */

import { supabase } from "@outreach/database/client";
import { createFollowUpSchema } from "@outreach/shared/validations";
import type { IFollowUp, PaginatedResponse } from "@outreach/shared";

function rowToFollowUp(row: Record<string, unknown>): IFollowUp {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    leadId: row.lead_id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    dueDate: row.due_date as string,
    status: row.status as IFollowUp["status"],
    isRecurring: row.is_recurring as boolean,
    recurringInterval: row.recurring_interval as number | undefined,
    recurringUnit: row.recurring_unit as IFollowUp["recurringUnit"],
    completedAt: row.completed_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export interface ListFollowUpsOptions {
  userId: string;
  leadId?: string;
  status?: string[];
  page?: number;
  limit?: number;
}

export type UpdateFollowUpInput = Partial<{
  title: string;
  description: string;
  dueDate: string;
  status: string;
  isRecurring: boolean;
  recurringInterval: number;
  recurringUnit: string;
  completedAt: string;
}>;

export async function listFollowUps(options: ListFollowUpsOptions): Promise<PaginatedResponse<IFollowUp>> {
  const { userId, leadId, status, page = 1, limit = 20 } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, limit);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("follow_ups")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .range(from, to);

  if (status?.length) query = query.in("status", status);
  if (leadId) query = query.eq("lead_id", leadId);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map(rowToFollowUp),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function createFollowUp(
  userId: string,
  input: unknown
): Promise<{ followUp: IFollowUp | null; validationError: string | null }> {
  const parsed = createFollowUpSchema.safeParse(input);
  if (!parsed.success) {
    return { followUp: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const { data, error } = await supabase
    .from("follow_ups")
    .insert({
      user_id: userId,
      lead_id: parsed.data.leadId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      due_date: parsed.data.dueDate,
      is_recurring: parsed.data.isRecurring,
      recurring_interval: parsed.data.recurringInterval ?? null,
      recurring_unit: parsed.data.recurringUnit ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("activities").insert({
    user_id: userId,
    lead_id: parsed.data.leadId,
    type: "follow_up_created",
    description: `Follow-up scheduled: ${parsed.data.title}`,
    icon: "calendar-plus",
  });

  return { followUp: rowToFollowUp(data), validationError: null };
}

export async function updateFollowUp(
  id: string,
  userId: string,
  updates: UpdateFollowUpInput
): Promise<IFollowUp | null> {
  if (updates.status === "completed" && !updates.completedAt) {
    updates.completedAt = new Date().toISOString();
  }

  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
  if (updates.recurringInterval !== undefined) dbUpdates.recurring_interval = updates.recurringInterval;
  if (updates.recurringUnit !== undefined) dbUpdates.recurring_unit = updates.recurringUnit;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

  const { data, error } = await supabase
    .from("follow_ups")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) return null;

  if (updates.status === "completed") {
    await supabase.from("activities").insert({
      user_id: userId,
      lead_id: data.lead_id,
      type: "follow_up_completed",
      description: `Follow-up completed: ${data.title}`,
      icon: "check-circle",
    });
  }

  return rowToFollowUp(data);
}

export async function deleteFollowUp(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("follow_ups")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
