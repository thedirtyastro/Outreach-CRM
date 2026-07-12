/**
 * server/services/dashboard.service.ts
 */

import { supabase } from "@outreach/database/client";
import type { DashboardStats } from "@outreach/shared";

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayIso = today.toISOString();
  const tomorrowIso = tomorrow.toISOString();

  const [
    totalLeadsRes,
    todayLeadsRes,
    followUpsTodayRes,
    pendingRepliesRes,
    positiveRepliesRes,
    negativeRepliesRes,
    meetingsRes,
    projectsWonRes,
    projectsLostRes,
    revenueRes,
    expectedRevenueRes,
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false).gte("created_at", todayIso).lt("created_at", tomorrowIso),
    supabase.from("follow_ups").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending").gte("due_date", todayIso).lt("due_date", tomorrowIso),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false).eq("response", "none").in("status", ["message_sent", "viewed"]),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false).eq("response", "positive"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false).eq("response", "negative"),
    supabase.from("meetings").select("*", { count: "exact", head: true }).eq("user_id", userId).gte("start_time", todayIso),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "won"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "lost"),
    // Revenue: sum of budget for won leads
    supabase.from("leads").select("budget").eq("user_id", userId).eq("status", "won"),
    // Expected revenue: sum of expected_revenue for non-lost leads
    supabase.from("leads").select("expected_revenue").eq("user_id", userId).eq("is_archived", false),
  ]);

  const totalLeads = totalLeadsRes.count ?? 0;
  const projectsWon = projectsWonRes.count ?? 0;

  const revenue = (revenueRes.data ?? []).reduce((s, r) => s + (r.budget ?? 0), 0);
  const expectedRevenue = (expectedRevenueRes.data ?? []).reduce((s, r) => s + (r.expected_revenue ?? 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((projectsWon / totalLeads) * 100 * 10) / 10 : 0;

  return {
    totalLeads,
    todayLeads: todayLeadsRes.count ?? 0,
    followUpsToday: followUpsTodayRes.count ?? 0,
    pendingReplies: pendingRepliesRes.count ?? 0,
    positiveReplies: positiveRepliesRes.count ?? 0,
    negativeReplies: negativeRepliesRes.count ?? 0,
    meetings: meetingsRes.count ?? 0,
    projectsWon,
    projectsLost: projectsLostRes.count ?? 0,
    revenue,
    expectedRevenue,
    conversionRate,
    avgResponseTime: 0,
  };
}
