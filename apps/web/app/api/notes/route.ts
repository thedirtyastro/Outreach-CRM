import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { z } from "zod";

const noteSchema = z.object({
  leadId: z.string(),
  content: z.string().min(1),
  isPinned: z.boolean().optional().default(false),
  attachments: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    let query = supabase.from("notes").select("*").eq("user_id", session.user.id).order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    if (leadId) query = query.eq("lead_id", leadId);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const validated = noteSchema.parse(body);
    const { data: note, error } = await supabase.from("notes").insert({ user_id: session.user.id, lead_id: validated.leadId, content: validated.content, is_pinned: validated.isPinned, attachments: validated.attachments || [] }).select().single();
    if (error) throw error;
    await supabase.from("activities").insert({ user_id: session.user.id, lead_id: validated.leadId, type: "note_added", description: "Note added", icon: "FileText", metadata: { noteId: note.id } });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
