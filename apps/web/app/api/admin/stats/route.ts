import { NextResponse } from "next/server";
import { supabase } from "@outreach/database/client";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Total users
    const { count: totalUsers } = await supabase
      .from("user")
      .select("*", { count: "exact", head: true });

    // New users today
    const { count: newUsersToday } = await supabase
      .from("user")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart);

    // New users this week
    const { count: newUsersWeek } = await supabase
      .from("user")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo);

    // New users this month
    const { count: newUsersMonth } = await supabase
      .from("user")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthAgo);

    // Total leads
    const { count: totalLeads } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    // Total emails sent
    const { count: totalEmails } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent");

    // Total deals won
    const { count: dealsWon } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "won");

    // Total follow-ups
    const { count: totalFollowUps } = await supabase
      .from("follow_ups")
      .select("*", { count: "exact", head: true });

    // Total meetings
    const { count: totalMeetings } = await supabase
      .from("meetings")
      .select("*", { count: "exact", head: true });

    // Total templates
    const { count: totalTemplates } = await supabase
      .from("templates")
      .select("*", { count: "exact", head: true });

    // Recent signups (last 30 days, grouped by day)
    const { data: recentUsers } = await supabase
      .from("user")
      .select("created_at")
      .gte("created_at", monthAgo)
      .order("created_at", { ascending: true });

    // Group signups by day
    const signupsByDay: Record<string, number> = {};
    (recentUsers as { created_at: string }[] | null)?.forEach((u) => {
      const day = u.created_at.slice(0, 10);
      signupsByDay[day] = (signupsByDay[day] ?? 0) + 1;
    });

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      newUsersToday: newUsersToday ?? 0,
      newUsersWeek: newUsersWeek ?? 0,
      newUsersMonth: newUsersMonth ?? 0,
      totalLeads: totalLeads ?? 0,
      totalEmails: totalEmails ?? 0,
      dealsWon: dealsWon ?? 0,
      totalFollowUps: totalFollowUps ?? 0,
      totalMeetings: totalMeetings ?? 0,
      totalTemplates: totalTemplates ?? 0,
      signupsByDay,
    });
  } catch (error) {
    console.error("[admin/stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
