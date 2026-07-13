"use client";

import {
  Users,
  CalendarCheck,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Trophy,
  XCircle,
  DollarSign,
  TrendingUp,
  Percent,
  UserPlus,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { ActivityFeed } from "./activity-feed";
import { LeadsChart } from "./leads-chart";
import { PipelineFunnel } from "./pipeline-funnel";
import type { DashboardStats } from "@outreach/shared";

interface DashboardContentProps {
  stats: DashboardStats | null;
}

export function DashboardContent({ stats: s }: DashboardContentProps) {
  const stats = s ?? {
    totalLeads: 0,
    todayLeads: 0,
    followUpsToday: 0,
    pendingReplies: 0,
    positiveReplies: 0,
    negativeReplies: 0,
    meetings: 0,
    projectsWon: 0,
    projectsLost: 0,
    revenue: 0,
    expectedRevenue: 0,
    conversionRate: 0,
    avgResponseTime: 0,
  };

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Today's Leads",
      value: stats.todayLeads,
      icon: UserPlus,
      color: "purple" as const,
    },
    {
      title: "Follow-ups Today",
      value: stats.followUpsToday,
      icon: CalendarCheck,
      color: "yellow" as const,
    },
    {
      title: "Pending Replies",
      value: stats.pendingReplies,
      icon: MessageSquare,
      color: "default" as const,
    },
    {
      title: "Positive Replies",
      value: stats.positiveReplies,
      icon: ThumbsUp,
      color: "green" as const,
    },
    {
      title: "Negative Replies",
      value: stats.negativeReplies,
      icon: ThumbsDown,
      color: "red" as const,
    },
    {
      title: "Upcoming Meetings",
      value: stats.meetings,
      icon: Calendar,
      color: "blue" as const,
    },
    {
      title: "Projects Won",
      value: stats.projectsWon,
      icon: Trophy,
      color: "green" as const,
    },
    {
      title: "Projects Lost",
      value: stats.projectsLost,
      icon: XCircle,
      color: "red" as const,
    },
    {
      title: "Revenue",
      value: stats.revenue,
      icon: DollarSign,
      color: "green" as const,
      format: "currency" as const,
    },
    {
      title: "Expected Revenue",
      value: stats.expectedRevenue,
      icon: TrendingUp,
      color: "purple" as const,
      format: "currency" as const,
    },
    {
      title: "Conversion Rate",
      value: stats.conversionRate,
      icon: Percent,
      color: "blue" as const,
      format: "percent" as const,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1400px]">
      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <StatCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Leads Over Time</h2>
          <LeadsChart />
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Pipeline Funnel</h2>
          <PipelineFunnel />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
          <ActivityFeed limit={8} />
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-1">Quick Stats</h2>
          <div className="space-y-3 mt-4">
            <QuickStat label="Avg Response Time" value={`${stats.avgResponseTime}h`} />
            <QuickStat label="Win Rate" value={`${stats.conversionRate}%`} color="green" />
            <QuickStat label="Expected Pipeline" value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(stats.expectedRevenue)} color="blue" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, color = "default" }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    default: "text-foreground",
    green: "text-green-400",
    blue: "text-blue-400",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${colors[color]}`}>{value}</span>
    </div>
  );
}
