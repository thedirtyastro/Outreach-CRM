import { headers } from "next/headers";
import { auth } from "@outreach/server/auth";
import { connectDB, Lead, FollowUp, Meeting } from "@outreach/database";
import { Header } from "@/components/layout/header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { DashboardStats } from "@outreach/shared";

async function getDashboardStats(userId: string): Promise<DashboardStats> {
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
    Lead.countDocuments({
      userId,
      isArchived: false,
      createdAt: { $gte: today, $lt: tomorrow },
    }),
    FollowUp.countDocuments({
      userId,
      status: "pending",
      dueDate: { $gte: today, $lt: tomorrow },
    }),
    Lead.countDocuments({
      userId,
      isArchived: false,
      response: "none",
      status: { $in: ["message_sent", "viewed"] },
    }),
    Lead.countDocuments({ userId, isArchived: false, response: "positive" }),
    Lead.countDocuments({ userId, isArchived: false, response: "negative" }),
    Meeting.countDocuments({ userId, startTime: { $gte: today } }),
    Lead.countDocuments({ userId, status: "won" }),
    Lead.countDocuments({ userId, status: "lost" }),
    Lead.aggregate([
      { $match: { userId, status: "won" } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]),
    Lead.aggregate([
      { $match: { userId, isArchived: false } },
      { $group: { _id: null, total: { $sum: "$expectedRevenue" } } },
    ]),
  ]);

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
    revenue: revenueAgg[0]?.total ?? 0,
    expectedRevenue: expectedRevenueAgg[0]?.total ?? 0,
    conversionRate:
      totalLeads > 0
        ? Math.round((projectsWon / totalLeads) * 100 * 10) / 10
        : 0,
    avgResponseTime: 0,
  };
}

export default async function DashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const userId = session?.user?.id ?? "";

  const stats = userId ? await getDashboardStats(userId) : null;

  return (
    <>
      <Header
        title="Dashboard"
        description={`Good ${getTimeOfDay()}, ${session?.user?.name?.split(" ")[0] ?? "there"}`}
      />
      <div className="flex-1 p-6">
        <DashboardContent stats={stats} />
      </div>
    </>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
