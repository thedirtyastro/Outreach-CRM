/**
 * server/services/followup.service.ts
 *
 * Database operations for the FollowUp entity.
 */

import { connectDB, FollowUp, Activity } from "@outreach/database";
import { createFollowUpSchema } from "@outreach/shared/validations";
import type { IFollowUp, PaginatedResponse } from "@outreach/shared";
import type { z } from "zod";

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

/** Paginated list of follow-ups with optional filters. */
export async function listFollowUps(
  options: ListFollowUpsOptions
): Promise<PaginatedResponse<IFollowUp>> {
  await connectDB();

  const { userId, leadId, status, page = 1, limit = 20 } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, limit);
  const skip = (safePage - 1) * safeLimit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { userId };
  if (status?.length) query.status = { $in: status };
  if (leadId) query.leadId = leadId;

  const [data, total] = await Promise.all([
    FollowUp.find(query).sort({ dueDate: 1 }).skip(skip).limit(safeLimit).lean(),
    FollowUp.countDocuments(query),
  ]);

  return {
    data: data as unknown as IFollowUp[],
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

/** Create a follow-up and log activity. */
export async function createFollowUp(
  userId: string,
  input: unknown
): Promise<{ followUp: IFollowUp | null; validationError: string | null }> {
  await connectDB();

  const parsed = createFollowUpSchema.safeParse(input);
  if (!parsed.success) {
    return { followUp: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const followUp = await FollowUp.create({ ...parsed.data, userId });

  await Activity.create({
    userId,
    leadId: parsed.data.leadId,
    type: "follow_up_created",
    description: `Follow-up scheduled: ${parsed.data.title}`,
    icon: "calendar-plus",
  });

  return { followUp: followUp.toJSON() as unknown as IFollowUp, validationError: null };
}

/** Update a follow-up. Marks completedAt if status is set to "completed". */
export async function updateFollowUp(
  id: string,
  userId: string,
  updates: UpdateFollowUpInput
): Promise<IFollowUp | null> {
  await connectDB();

  if (updates.status === "completed" && !updates.completedAt) {
    updates.completedAt = new Date().toISOString();
  }

  const followUp = await FollowUp.findOneAndUpdate(
    { _id: id, userId },
    updates,
    { new: true }
  );

  if (followUp && updates.status === "completed") {
    await Activity.create({
      userId,
      leadId: followUp.leadId,
      type: "follow_up_completed",
      description: `Follow-up completed: ${followUp.title}`,
      icon: "check-circle",
    });
  }

  return followUp ? (followUp.toJSON() as unknown as IFollowUp) : null;
}

/** Delete a follow-up. */
export async function deleteFollowUp(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await FollowUp.findOneAndDelete({ _id: id, userId });
  return result !== null;
}
