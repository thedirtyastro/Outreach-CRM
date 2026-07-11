/**
 * server/services/activity.service.ts
 *
 * Database operations for the Activity entity.
 */

import { connectDB, Activity } from "@outreach/database";
import type { IActivity, PaginatedResponse } from "@outreach/shared";

export interface ListActivitiesOptions {
  userId: string;
  leadId?: string;
  page?: number;
  limit?: number;
}

/** Paginated list of activities, optionally filtered by leadId. */
export async function listActivities(
  options: ListActivitiesOptions
): Promise<PaginatedResponse<IActivity>> {
  await connectDB();

  const { userId, leadId, page = 1, limit = 20 } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { userId };
  if (leadId) query.leadId = leadId;

  const [data, total] = await Promise.all([
    Activity.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Activity.countDocuments(query),
  ]);

  return {
    data: data as unknown as IActivity[],
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}
