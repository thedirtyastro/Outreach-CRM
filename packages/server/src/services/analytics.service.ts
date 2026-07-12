/**
 * server/services/analytics.service.ts
 */

import { supabase } from "@outreach/database/client";
import { subDays, startOfMonth, eachDayOfInterval, format } from "date-fns";

export type AnalyticsRange = "7d" | "30d" | "90d" | "this_month";

function getStartDate(range: AnalyticsRange): Date {
  const now = new Date();
  switch (range) {
    case "7d": return subDays(now, 7);
    case "30d": return subDays(now, 30);
    case "90d": return subDays(now, 90);
    case "this_month": return startOfMonth(now);
    default: return subDays(now, 30);
  }
}

export async function getAnalytics(userId: string, range: AnalyticsRange = "30d") {
  const now = new Date();
  const startDate = getStartDate(range);
  const startIso = startDate.toISOString();
  const endIso = now.toISOString();

  // Run all queries in parallel
  const [
    totalLeadsRes,
    wonLeadsRes,
    lostLeadsRes,
    archivedLeadsRes,
    leadsInRangeRes,
    emailStatsRes,
    platformStatsRes,
    statusDistRes,
    recentActivitiesRes,
    dailyLeadsRes,
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "won"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "lost"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", true),

    supabase
      .from("leads")
      .select("status,platform,budget,expected_revenue,created_at")
      .eq("user_id", userId)
      .gte("created_at", startIso)
      .lte("created_at", endIso),

    // Email status distribution
    supabase
      .from("emails")
      .select("status")
      .eq("user_id", userId)
      .gte("created_at", startIso),

    // Platform distribution
    supabase
      .from("leads")
      .select("platform")
      .eq("user_id", userId)
      .eq("is_archived", false),

    // Status distribution
    supabase
      .from("leads")
      .select("status")
      .eq("user_id", userId)
      .eq("is_archived", false),

    // Recent activities
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Leads per day in range
    supabase
      .from("leads")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", startIso)
      .lte("created_at", endIso),
  ]);

  const totalLeads = totalLeadsRes.count ?? 0;
  const wonLeads = wonLeadsRes.count ?? 0;
  const lostLeads = lostLeadsRes.count ?? 0;
  const archivedLeads = archivedLeadsRes.count ?? 0;
  const leadsInRange = leadsInRangeRes.data ?? [];

  // Revenue calculations
  const totalRevenue = leadsInRange
    .filter((l) => l.status === "won")
    .reduce((sum, l) => sum + (l.budget ?? 0), 0);

  const expectedRevenue = leadsInRange
    .filter((l) => !["lost", "ghosted", "rejected", "archived"].includes(l.status))
    .reduce((sum, l) => sum + (l.expected_revenue ?? 0), 0);

  const wonInRange = leadsInRange.filter((l) => l.status === "won").length;
  const conversionRate = leadsInRange.length
    ? Math.round((wonInRange / leadsInRange.length) * 100)
    : 0;

  // Build daily chart data
  const allDays = eachDayOfInterval({ start: startDate, end: now });
  const dailyMap = new Map<string, number>();
  for (const row of dailyLeadsRes.data ?? []) {
    const day = format(new Date(row.created_at), "yyyy-MM-dd");
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const dailyChartData = allDays.map((day) => ({
    date: format(day, "MMM dd"),
    leads: dailyMap.get(format(day, "yyyy-MM-dd")) ?? 0,
  }));

  // Platform distribution
  const platformMap = new Map<string, number>();
  for (const row of platformStatsRes.data ?? []) {
    const p = row.platform || "other";
    platformMap.set(p, (platformMap.get(p) ?? 0) + 1);
  }
  const platformData = Array.from(platformMap.entries()).map(([platform, count]) => ({ platform, count }));

  // Status distribution
  const statusMap = new Map<string, number>();
  for (const row of statusDistRes.data ?? []) {
    statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
  }

  const statusOrder = [
    "new", "initiated", "message_sent", "viewed", "responded",
    "interested", "meeting_scheduled", "proposal_sent", "negotiation", "won",
  ];
  const funnelData = statusOrder.map((s) => ({ status: s, count: statusMap.get(s) ?? 0 }));

  // Email stats
  const emailStatusMap = new Map<string, number>();
  for (const row of emailStatsRes.data ?? []) {
    emailStatusMap.set(row.status, (emailStatusMap.get(row.status) ?? 0) + 1);
  }

  return {
    summary: {
      totalLeads,
      wonLeads,
      lostLeads,
      archivedLeads,
      conversionRate,
      totalRevenue,
      expectedRevenue,
      newLeadsInRange: leadsInRange.length,
    },
    charts: {
      dailyLeads: dailyChartData,
      platformDistribution: platformData,
      statusFunnel: funnelData,
      statusDistribution: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
    },
    recentActivities: recentActivitiesRes.data ?? [],
  };
}
