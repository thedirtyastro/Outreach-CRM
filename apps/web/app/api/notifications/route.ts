import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { supabase } from "@outreach/database/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq("is_read", false);

    const { data: notifications, error } = await query;
    if (error) throw error;

    const { count: unreadCount, error: countError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (countError) throw countError;

    return NextResponse.json({ notifications: notifications ?? [], unreadCount: unreadCount ?? 0 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const markAll = searchParams.get("markAll") === "true";

    if (markAll) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const { ids } = body as { ids: string[] };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", ids)
      .eq("user_id", session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
