import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
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

    const { data: tag, error } = await supabase
      .from("tags")
      .update(validated)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
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
      .from("tags")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;
    if (!count) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
