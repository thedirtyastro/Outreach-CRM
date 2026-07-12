import { NextResponse } from "next/server";
import { supabase } from "@outreach/database/client";

export async function GET() {
  try {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // User stats
    const { count: totalUsers } = await supabase
      .from("user")
      .select("*", { count: "exact", head: true });

    const { count: newThisMonth } = await supabase
      .from("user")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthAgo);

    // Active users = users who have activities in the last 30 days
    const { data: activeUserIds } = await supabase
      .from("activities")
      .select("user_id")
      .gte("created_at", monthAgo);

    const uniqueActiveUsers = new Set((activeUserIds ?? []).map((a: { user_id: string }) => a.user_id));

    // Leads stats
    const { count: totalLeads } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    // Leads by platform
    const { data: leadsByPlatform } = await supabase
      .from("leads")
      .select("platform");

    const platformCounts: Record<string, number> = {};
    (leadsByPlatform as { platform: string }[] | null)?.forEach((l) => {
      platformCounts[l.platform] = (platformCounts[l.platform] ?? 0) + 1;
    });

    // Leads by status
    const { data: leadsByStatus } = await supabase
      .from("leads")
      .select("status");

    const statusCounts: Record<string, number> = {};
    (leadsByStatus as { status: string }[] | null)?.forEach((l) => {
      statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
    });

    // Email stats
    const { count: emailsSent } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent");

    const { count: emailsOpened } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .not("opened_at", "is", null);

    const { count: emailsClicked } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true })
      .not("clicked_at", "is", null);

    const { count: emailsBounced } = await supabase
      .from("email_events")
      .select("*", { count: "exact", head: true })
      .eq("type", "bounced");

    // Deals
    const { count: dealsWon } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "won");

    const { count: dealsLost } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "lost");

    // Revenue from won deals
    const { data: wonLeads } = await supabase
      .from("leads")
      .select("expected_revenue")
      .eq("status", "won");

    const totalRevenue = (wonLeads as { expected_revenue: number | null }[] | null)?.reduce((sum, l) => sum + (Number(l.expected_revenue) || 0), 0) ?? 0;

    const totalClosedDeals = (dealsWon ?? 0) + (dealsLost ?? 0);
    const winRate = totalClosedDeals > 0 ? Math.round(((dealsWon ?? 0) / totalClosedDeals) * 100) : 0;

    return NextResponse.json({
      users: {
        total: totalUsers ?? 0,
        active: uniqueActiveUsers.size,
        newThisMonth: newThisMonth ?? 0,
      },
      leads: {
        total: totalLeads ?? 0,
        byPlatform: platformCounts,
        byStatus: statusCounts,
      },
      emails: {
        total: emailsSent ?? 0,
        sent: emailsSent ?? 0,
        opened: emailsOpened ?? 0,
        clicked: emailsClicked ?? 0,
        bounced: emailsBounced ?? 0,
      },
      deals: {
        won: dealsWon ?? 0,
        lost: dealsLost ?? 0,
        winRate,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("[admin/analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
