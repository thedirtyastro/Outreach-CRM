import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { connectDB } from "@outreach/database/connection";
import { Meeting } from "@outreach/database/schemas/meeting.schema";
import { Activity } from "@outreach/database/schemas/activity.schema";
import { z } from "zod";

const meetingSchema = z.object({
  leadId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["call", "video", "in_person", "other"]),
  startTime: z.string(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    await connectDB();

    const filter: Record<string, unknown> = { userId: session.user.id };
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

    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = meetingSchema.parse(body);

    await connectDB();

    const meeting = await Meeting.create({
      ...validated,
      userId: session.user.id,
    });

    await Activity.create({
      userId: session.user.id,
      leadId: validated.leadId,
      type: "meeting_added",
      description: `Meeting scheduled: ${validated.title}`,
      icon: "Calendar",
      metadata: { meetingId: meeting._id },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
