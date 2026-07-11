import { NextRequest, NextResponse } from "next/server";
import { auth } from "@outreach/server/auth";
import { connectDB } from "@outreach/database/connection";
import { Lead } from "@outreach/database/schemas/lead.schema";
import { Email } from "@outreach/database/schemas/email.schema";
import { EmailEvent } from "@outreach/database/schemas/email.schema";
import { Activity } from "@outreach/database/schemas/activity.schema";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const userId = session.user.id;

    await connectDB();

    // Determine date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "7d": startDate = subDays(now, 7); break;
      case "30d": startDate = subDays(now, 30); break;
      case "90d": startDate = subDays(now, 90); break;
      case "this_month": startDate = startOfMonth(now); break;
      default: startDate = subDays(now, 30);
    }

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
      // Total leads
      Lead.countDocuments({ userId, isArchived: false }),

      // Won projects
      Lead.countDocuments({ userId, status: "won" }),

      // Lost projects
      Lead.countDocuments({ userId, status: "lost" }),

      // Archived
      Lead.countDocuments({ userId, isArchived: true }),

      // Leads in date range
      Lead.find({
        userId,
        createdAt: { $gte: startDate, $lte: now },
      }).select("status platform budget expectedRevenue createdAt").lean(),

      // Email stats
      Email.aggregate([
        { $match: { userId: session.user.id as unknown, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Platform distribution
      Lead.aggregate([
        { $match: { userId: session.user.id as unknown, isArchived: false } },
        {
          $group: {
            _id: "$platform",
            count: { $sum: 1 },
          },
        },
      ]),

      // Status distribution
      Lead.aggregate([
        { $match: { userId: session.user.id as unknown, isArchived: false } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent activities
      Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Daily leads for chart
      Lead.aggregate([
        {
          $match: {
            userId: session.user.id as unknown,
            createdAt: { $gte: startDate, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Revenue calculations
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

    // Build daily chart data filling missing dates
    const allDays = eachDayOfInterval({ start: startDate, end: now });
    const dailyMap = new Map(dailyLeads.map((d) => [d._id, d.count]));
    const dailyChartData = allDays.map((day) => ({
      date: format(day, "MMM dd"),
      leads: dailyMap.get(format(day, "yyyy-MM-dd")) || 0,
    }));

    // Build platform data
    const platformData = platformStats.map((p) => ({
      platform: p._id || "other",
      count: p.count,
    }));

    // Build status funnel
    const statusOrder = [
      "new", "initiated", "message_sent", "viewed", "responded",
      "interested", "meeting_scheduled", "proposal_sent", "negotiation",
      "won",
    ];
    const statusMap = new Map(statusDistribution.map((s) => [s._id, s.count]));
    const funnelData = statusOrder.map((s) => ({
      status: s,
      count: statusMap.get(s) || 0,
    }));

    return NextResponse.json({
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
          status: s._id,
          count: s.count,
        })),
      },
      recentActivities,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
