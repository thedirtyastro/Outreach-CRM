/**
 * server/services/meeting.service.ts
 *
 * Database operations for the Meeting entity.
 */

import { connectDB, Activity } from "@outreach/database";
import { Meeting } from "@outreach/database/schemas/meeting.schema";
import { createMeetingSchema } from "@outreach/shared/validations";
import type { IMeeting } from "@outreach/shared";

export interface ListMeetingsOptions {
  userId: string;
  leadId?: string;
  start?: string;
  end?: string;
}

/** List meetings with optional date-range and leadId filters. */
export async function listMeetings(options: ListMeetingsOptions): Promise<IMeeting[]> {
  await connectDB();

  const { userId, leadId, start, end } = options;
  const filter: Record<string, unknown> = { userId };

  if (leadId) filter.leadId = leadId;
  if (start || end) {
    filter.startTime = {};
    if (start) (filter.startTime as Record<string, unknown>).$gte = new Date(start);
    if (end) (filter.startTime as Record<string, unknown>).$lte = new Date(end);
  }

  const meetings = await Meeting.find(filter)
    .sort({ startTime: 1 })
    .populate("leadId", "name company email profileImage")
    .lean();

  return meetings as unknown as IMeeting[];
}

/** Create a meeting and log activity. */
export async function createMeeting(
  userId: string,
  input: unknown
): Promise<{ meeting: IMeeting | null; validationError: string | null }> {
  await connectDB();

  const parsed = createMeetingSchema.safeParse(input);
  if (!parsed.success) {
    return { meeting: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const meeting = await Meeting.create({ ...parsed.data, userId });

  await Activity.create({
    userId,
    leadId: parsed.data.leadId,
    type: "meeting_added",
    description: `Meeting scheduled: ${parsed.data.title}`,
    icon: "Calendar",
    metadata: { meetingId: meeting._id },
  });

  return { meeting: meeting.toObject() as unknown as IMeeting, validationError: null };
}

/** Update a meeting. */
export async function updateMeeting(
  id: string,
  userId: string,
  updates: Record<string, unknown>
): Promise<IMeeting | null> {
  await connectDB();
  const meeting = await Meeting.findOneAndUpdate({ _id: id, userId }, updates, { new: true }).lean();
  return meeting as unknown as IMeeting | null;
}

/** Delete a meeting. */
export async function deleteMeeting(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await Meeting.findOneAndDelete({ _id: id, userId });
  return result !== null;
}
