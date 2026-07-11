/**
 * server/services/analytics.service.ts
 *
 * Aggregation logic for the analytics endpoint.
 */

import { connectDB, Activity } from "@outreach/database";
import { Lead } from "@outreach/database/schemas/lead.schema";
import { Email } from "@outreach/database/schemas/email.schema";
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

/** Returns all analytics data for the analytics page. */
export async function getAnalytics(userId: string, range: AnalyticsRange = "30d") {
  await connectDB();

  const now = new Date();
  const startDate = getStartDate(range);

  const [
    totalLeads,
    wonLeads,
    lostLeads,
    archivedLeads,
    leadsInRange,
    emailStats,
    platformStats,
    statusDistribution,
    recentActivities,
    dailyLeads,
  ] = await Promise.all([
    Lead.countDocuments({ userId, isArchived: false }),
    Lead.countDocuments({ userId, status: "won" }),
    Lead.countDocuments({ userId, status: "lost" }),
    Lead.countDocuments({ userId, isArchived: true }),

    Lead.find({
      userId,
      createdAt: { $gte: startDate, $lte: now },
    }).select("status platform budget expectedRevenue createdAt").lean(),

    Email.aggregate([
      { $match: { userId: userId as unknown, createdAt: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Lead.aggregate([
      { $match: { userId: userId as unknown, isArchived: false } },
      { $group: { _id: "$platform", count: { $sum: 1 } } },
    ]),

    Lead.aggregate([
      { $match: { userId: userId as unknown, isArchived: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Activity.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),

    Lead.aggregate([
      {
        $match: {
          userId: userId as unknown,
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue = leadsInRange
    .filter((l) => l.status === "won")
    .reduce((sum, l) => sum + (l.budget || 0), 0);

  const expectedRevenue = leadsInRange
    .filter((l) => !["lost", "ghosted", "rejected", "archived"].includes(l.status))
    .reduce((sum, l) => sum + (l.expectedRevenue || 0), 0);

  const wonInRange = leadsInRange.filter((l) => l.status === "won").length;
  const conversionRate = leadsInRange.length
    ? Math.round((wonInRange / leadsInRange.length) * 100)
    : 0;

  // Daily chart data — fill in missing dates with 0
  const allDays = eachDayOfInterval({ start: startDate, end: now });
  const dailyMap = new Map(dailyLeads.map((d) => [d._id, d.count]));
  const dailyChartData = allDays.map((day) => ({
    date: format(day, "MMM dd"),
    leads: dailyMap.get(format(day, "yyyy-MM-dd")) || 0,
  }));

  const platformData = platformStats.map((p) => ({
    platform: (p._id as string) || "other",
    count: p.count as number,
  }));

  const statusOrder = [
    "new", "initiated", "message_sent", "viewed", "responded",
    "interested", "meeting_scheduled", "proposal_sent", "negotiation", "won",
  ];
  const statusMap = new Map(statusDistribution.map((s) => [s._id, s.count]));
  const funnelData = statusOrder.map((s) => ({
    status: s,
    count: (statusMap.get(s) as number) || 0,
  }));

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
      statusDistribution: statusDistribution.map((s) => ({
        status: s._id as string,
        count: s.count as number,
      })),
    },
    recentActivities,
  };
}
