import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { z } from "zod";

const updateSchema = z.object({
  content: z.string().min(1).optional(),
  isPinned: z.boolean().optional(),
  attachments: z.array(z.string()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updates: Record<string, unknown> = {};
    if (validated.content !== undefined) updates.content = validated.content;
    if (validated.isPinned !== undefined) updates.is_pinned = validated.isPinned;
    if (validated.attachments !== undefined) updates.attachments = validated.attachments;

    const { data: note, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const { error, count } = await supabase
      .from("notes")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;
    if (!count) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
