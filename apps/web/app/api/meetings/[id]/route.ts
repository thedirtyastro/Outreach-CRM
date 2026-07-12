import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["call", "video", "in_person", "other"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { data, error } = await supabase.from("meetings").select("*, lead:leads(id,name,company,email,profile_image)").eq("id", id).eq("user_id", session.user.id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch meeting" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updates: Record<string, unknown> = {};
    if (validated.title !== undefined) updates.title = validated.title;
    if (validated.description !== undefined) updates.description = validated.description;
    if (validated.type !== undefined) updates.type = validated.type;
    if (validated.startTime !== undefined) updates.start_time = validated.startTime;
    if (validated.endTime !== undefined) updates.end_time = validated.endTime;
    if (validated.location !== undefined) updates.location = validated.location;
    if (validated.meetingUrl !== undefined) updates.meeting_url = validated.meetingUrl;
    if (validated.notes !== undefined) updates.notes = validated.notes;

    const { data, error } = await supabase.from("meetings").update(updates).eq("id", id).eq("user_id", session.user.id).select().single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { error, count } = await supabase.from("meetings").delete({ count: "exact" }).eq("id", id).eq("user_id", session.user.id);
    if (error) throw error;
    if (!count) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}
