import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("lead_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachmentId");
    if (!attachmentId) return NextResponse.json({ error: "attachmentId required" }, { status: 400 });

    const { data, error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("user_id", session.user.id)
      .eq("lead_id", id)
      .select("name")
      .single();

    if (error || !data) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });

    await supabase.from("activities").insert({ user_id: session.user.id, lead_id: id, type: "attachment_added", description: `Attachment removed: ${data.name}`, icon: "Paperclip" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}
