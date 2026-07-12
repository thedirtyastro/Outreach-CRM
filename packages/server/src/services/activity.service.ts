/**
 * server/services/activity.service.ts
 */

import { supabase } from "@outreach/database/client";
import type { IActivity, PaginatedResponse } from "@outreach/shared";

function rowToActivity(row: Record<string, unknown>): IActivity {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    leadId: row.lead_id as string,
    type: row.type as IActivity["type"],
    description: row.description as string,
    icon: row.icon as string | undefined,
    metadata: row.metadata as Record<string, unknown> | undefined,
    createdAt: row.created_at as string,
  };
}

export interface ListActivitiesOptions {
  userId: string;
  leadId?: string;
  page?: number;
  limit?: number;
}

export async function listActivities(
  options: ListActivitiesOptions
): Promise<PaginatedResponse<IActivity>> {
  const { userId, leadId, page = 1, limit = 20 } = options;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("activities")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (leadId) query = query.eq("lead_id", leadId);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map(rowToActivity),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}
