/**
 * server/services/dashboard.service.ts
 *
 * Aggregation logic for the dashboard stats endpoint.
 */

import { connectDB, Lead, FollowUp, Meeting } from "@outreach/database";
import type { DashboardStats } from "@outreach/shared";

/** Returns aggregated stats for the main dashboard. */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalLeads,
    todayLeads,
    followUpsToday,
    pendingReplies,
    positiveReplies,
    negativeReplies,
    meetings,
    projectsWon,
    projectsLost,
    revenueAgg,
    expectedRevenueAgg,
  ] = await Promise.all([
    Lead.countDocuments({ userId, isArchived: false }),
    Lead.countDocuments({ userId, isArchived: false, createdAt: { $gte: today, $lt: tomorrow } }),
    FollowUp.countDocuments({ userId, status: "pending", dueDate: { $gte: today, $lt: tomorrow } }),
    Lead.countDocuments({ userId, isArchived: false, response: "none", status: { $in: ["message_sent", "viewed"] } }),
    Lead.countDocuments({ userId, isArchived: false, response: "positive" }),
    Lead.countDocuments({ userId, isArchived: false, response: "negative" }),
    Meeting.countDocuments({ userId, startTime: { $gte: today } }),
    Lead.countDocuments({ userId, status: "won" }),
    Lead.countDocuments({ userId, status: "lost" }),
    Lead.aggregate([
      { $match: { userId: { $toString: userId }, status: "won" } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]),
    Lead.aggregate([
      { $match: { userId: { $toString: userId }, isArchived: false } },
      { $group: { _id: null, total: { $sum: "$expectedRevenue" } } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total ?? 0;
  const expectedRevenue = expectedRevenueAgg[0]?.total ?? 0;
  const conversionRate =
    totalLeads > 0 ? Math.round((projectsWon / totalLeads) * 100 * 10) / 10 : 0;

  return {
    totalLeads,
    todayLeads,
    followUpsToday,
    pendingReplies,
    positiveReplies,
    negativeReplies,
    meetings,
    projectsWon,
    projectsLost,
    revenue,
    expectedRevenue,
    conversionRate,
    avgResponseTime: 0,
  };
}
