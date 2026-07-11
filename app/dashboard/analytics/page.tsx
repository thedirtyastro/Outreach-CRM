"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { subDays, format } from "date-fns";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, Trophy } from "lucide-react";
import { Header } from "@/components/layout/header";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/types";

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  instagram: "#E1306C",
  github: "#6e5494",
  website: "#10b981",
  referral: "#f59e0b",
  email: "#6366f1",
  other: "#6b7280",
};

const TOOLTIP_STYLE = {
  background: "hsl(0 0% 5.5%)",
  border: "1px solid hsl(0 0% 12%)",
  borderRadius: "8px",
  fontSize: 12,
  color: "hsl(0 0% 98%)",
};

function KpiCard({ title, value, icon: Icon, sub, color = "text-foreground" }: {
  title: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{title}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [platformData, setPlatformData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [trendData, setTrendData] = useState<Array<{ date: string; leads: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch(`/api/leads?limit=500&dateFrom=${subDays(new Date(), 29).toISOString()}`),
        ]);

        const statsJson = await statsRes.json();
        if (statsJson.success) setStats(statsJson.data as DashboardStats);

        const leadsJson = await leadsRes.json();
        if (leadsJson.success) {
          const leads: Array<{ createdAt: string; platform: string }> = leadsJson.data.data ?? [];

          // Platform distribution
          const platformCounts: Record<string, number> = {};
          for (const lead of leads) {
            platformCounts[lead.platform] = (platformCounts[lead.platform] ?? 0) + 1;
          }
          setPlatformData(
            Object.entries(platformCounts).map(([name, value]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              value,
              color: PLATFORM_COLORS[name] ?? "#6b7280",
            }))
          );

          // 30-day trend
          const dateCounts: Record<string, number> = {};
          for (let i = 29; i >= 0; i--) {
            dateCounts[format(subDays(new Date(), i), "MMM d")] = 0;
          }
          for (const lead of leads) {
            const key = format(new Date(lead.createdAt), "MMM d");
            if (key in dateCounts) dateCounts[key]++;
          }
          setTrendData(Object.entries(dateCounts).map(([date, leads]) => ({ date, leads })));
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header title="Analytics" />
        <div className="flex-1 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Analytics" description="Performance overview" />
      <div className="flex-1 p-6 space-y-6 max-w-[1400px]">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            title="Total Leads"
            value={formatNumber(stats?.totalLeads ?? 0)}
            icon={Users}
            sub="All time"
          />
          <KpiCard
            title="Won Projects"
            value={formatNumber(stats?.projectsWon ?? 0)}
            icon={Trophy}
            color="text-green-400"
            sub={`${stats?.conversionRate ?? 0}% rate`}
          />
          <KpiCard
            title="Revenue"
            value={formatCurrency(stats?.revenue ?? 0)}
            icon={TrendingUp}
            color="text-green-400"
          />
          <KpiCard
            title="Expected Pipeline"
            value={formatCurrency(stats?.expectedRevenue ?? 0)}
            icon={TrendingUp}
            color="text-blue-400"
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 30-day trend */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Leads — Last 30 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="leads" stroke="hsl(221 83% 53%)" fill="url(#grad1)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform pie */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Lead Sources</h3>
            {platformData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {platformData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {platformData.slice(0, 5).map((p) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                        <span className="text-xs">{p.name}</span>
                      </div>
                      <span className="text-xs font-medium tabular-nums">{p.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Pipeline summary */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Pipeline Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Positive Replies", value: stats?.positiveReplies ?? 0, color: "text-green-400" },
              { label: "Negative Replies", value: stats?.negativeReplies ?? 0, color: "text-red-400" },
              { label: "Pending Replies", value: stats?.pendingReplies ?? 0, color: "text-yellow-400" },
              { label: "Meetings", value: stats?.meetings ?? 0, color: "text-blue-400" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-muted/20 rounded-lg">
                <p className={`text-2xl font-semibold tabular-nums ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
