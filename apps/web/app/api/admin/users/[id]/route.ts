import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@outreach/database/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user
    const { data: user, error: userError } = await supabase
      .from("user")
      .select("*")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user stats
    const [
      { count: leadsCount },
      { count: activeLeads },
      { count: wonDeals },
      { count: emailsSent },
      { count: meetingsCount },
      { count: followUpsCount },
      { count: notesCount },
      { count: templatesCount },
      { count: attachmentsCount },
    ] = await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", id),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", id).eq("is_archived", false).not("status", "in", "(won,lost,ghosted,rejected,archived)"),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", id).eq("status", "won"),
      supabase.from("emails").select("*", { count: "exact", head: true }).eq("user_id", id).eq("status", "sent"),
      supabase.from("meetings").select("*", { count: "exact", head: true }).eq("user_id", id),
      supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("user_id", id),
      supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", id),
      supabase.from("templates").select("*", { count: "exact", head: true }).eq("user_id", id),
      supabase.from("attachments").select("*", { count: "exact", head: true }).eq("user_id", id),
    ]);

    // Recent activities
    const { data: recentActivities } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Settings
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", id)
      .single();

    return NextResponse.json({
      user,
      stats: {
        totalLeads: leadsCount ?? 0,
        activeLeads: activeLeads ?? 0,
        wonDeals: wonDeals ?? 0,
        winRate: (leadsCount ?? 0) > 0 ? Math.round(((wonDeals ?? 0) / (leadsCount ?? 1)) * 100) : 0,
        emailsSent: emailsSent ?? 0,
        meetings: meetingsCount ?? 0,
        followUps: followUpsCount ?? 0,
        notes: notesCount ?? 0,
        templates: templatesCount ?? 0,
        attachments: attachmentsCount ?? 0,
      },
      recentActivities: recentActivities ?? [],
      settings,
    });
  } catch (error) {
    console.error("[admin/users/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete user's data (cascading from leads handles most)
    await supabase.from("settings").delete().eq("user_id", id);
    await supabase.from("tags").delete().eq("user_id", id);
    await supabase.from("templates").delete().eq("user_id", id);
    await supabase.from("notifications").delete().eq("user_id", id);
    await supabase.from("leads").delete().eq("user_id", id);
    await supabase.from("user").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/users/[id]] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
