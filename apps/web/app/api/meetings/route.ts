import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
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
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let query = supabase.from("meetings").select("*, lead:leads(id,name,company,email,profile_image)").eq("user_id", session.user.id).order("start_time", { ascending: true });
    if (leadId) query = query.eq("lead_id", leadId);
    if (start) query = query.gte("start_time", start);
    if (end) query = query.lte("start_time", end);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = meetingSchema.parse(body);

    const { data: meeting, error } = await supabase.from("meetings").insert({
      user_id: session.user.id, lead_id: validated.leadId, title: validated.title,
      description: validated.description ?? null, type: validated.type,
      start_time: validated.startTime, end_time: validated.endTime ?? null,
      location: validated.location ?? null, meeting_url: validated.meetingUrl ?? null,
      notes: validated.notes ?? null,
    }).select().single();

    if (error) throw error;

    await supabase.from("activities").insert({ user_id: session.user.id, lead_id: validated.leadId, type: "meeting_added", description: `Meeting scheduled: ${validated.title}`, icon: "Calendar", metadata: { meetingId: meeting.id } });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
