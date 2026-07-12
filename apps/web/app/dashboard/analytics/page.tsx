"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Trophy, Mail, BarChart3,
  MousePointerClick, MessageSquare, Layers,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsData {
  summary: {
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    archivedLeads: number;
    conversionRate: number;
    totalRevenue: number;
    expectedRevenue: number;
    newLeadsInRange: number;
  };
  charts: {
    dailyLeads: Array<{ date: string; leads: number }>;
    platformDistribution: Array<{ platform: string; count: number }>;
    statusFunnel: Array<{ status: string; count: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
  emailStats?: {
    sent: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

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

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  initiated: "#6366f1",
  message_sent: "#8b5cf6",
  viewed: "#06b6d4",
  responded: "#14b8a6",
  interested: "#22c55e",
  meeting_scheduled: "#10b981",
  proposal_sent: "#84cc16",
  negotiation: "#eab308",
  won: "#22c55e",
};

const TOOLTIP_STYLE = {
  background: "hsl(0 0% 5.5%)",
  border: "1px solid hsl(0 0% 12%)",
  borderRadius: "8px",
  fontSize: 12,
  color: "hsl(0 0% 98%)",
};

const DATE_RANGES = [
  { value: "7d",         label: "Last 7 days" },
  { value: "30d",        label: "Last 30 days" },
  { value: "90d",        label: "Last 90 days" },
  { value: "this_month", label: "This month" },
  { value: "this_year",  label: "This year" },
] as const;

type DateRange = (typeof DATE_RANGES)[number]["value"];

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  icon: Icon,
  sub,
  color = "text-foreground",
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {title}
        </span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/30 rounded-lg ${className}`} />;
}

function AnalyticsSkeleton() {
  return (
    <>
      <Header title="Analytics" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </>
  );
}

// ─── Email Performance Table ──────────────────────────────────────────────────

function EmailPerformanceTable({
  sent,
  openRate,
  clickRate,
  replyRate,
}: {
  sent: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
}) {
  const metrics = [
    { label: "Emails Sent", value: formatNumber(sent), icon: Mail, color: "text-blue-400" },
    { label: "Open Rate",   value: `${openRate.toFixed(1)}%`,  icon: BarChart3, color: "text-purple-400" },
    { label: "Click Rate",  value: `${clickRate.toFixed(1)}%`, icon: MousePointerClick, color: "text-cyan-400" },
    { label: "Reply Rate",  value: `${replyRate.toFixed(1)}%`, icon: MessageSquare, color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
          <m.icon className={`w-4 h-4 shrink-0 ${m.color}`} />
          <div>
            <p className={`text-lg font-semibold tabular-nums ${m.color}`}>{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [emailData, setEmailData] = useState<{
    sent: number; openRate: number; clickRate: number; replyRate: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (r: DateRange) => {
    setIsLoading(true);
    try {
      const [analyticsRes, emailsRes] = await Promise.all([
        fetch(`/api/analytics?range=${r}`),
        fetch(`/api/emails?limit=500&range=${r}`),
      ]);

      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        setData(json as AnalyticsData);
      }

      // Compute email performance from email list
      if (emailsRes.ok) {
        const emailJson = await emailsRes.json();
        const emails: Array<{
          status: string;
          openedAt?: string;
          clickedAt?: string;
          repliedAt?: string;
        }> = emailJson.emails ?? emailJson.data?.data ?? [];

        const sent = emails.filter((e) => e.status === "sent").length;
        const opened = emails.filter((e) => e.openedAt).length;
        const clicked = emails.filter((e) => e.clickedAt).length;
        const replied = emails.filter((e) => e.repliedAt).length;

        setEmailData({
          sent,
          openRate: sent > 0 ? (opened / sent) * 100 : 0,
          clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
          replyRate: sent > 0 ? (replied / sent) * 100 : 0,
        });
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [range, load]);

  if (isLoading) return <AnalyticsSkeleton />;

  const summary = data?.summary;
  const charts = data?.charts;

  // Build platform pie data
  const platformData = (charts?.platformDistribution ?? []).map((p) => ({
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    value: p.count,
    color: PLATFORM_COLORS[p.platform] ?? "#6b7280",
  }));

  // Build funnel data (only statuses with > 0 count)
  const funnelData = (charts?.statusFunnel ?? []).filter((s) => s.count > 0);

  return (
    <>
      <Header
        title="Analytics"
        description="Performance overview"
        actions={
          <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="flex-1 p-6 space-y-6 max-w-[1400px]">
        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <KpiCard
            title="Total Leads"
            value={formatNumber(summary?.totalLeads ?? 0)}
            icon={Users}
            sub="All time"
          />
          <KpiCard
            title="New in Range"
            value={formatNumber(summary?.newLeadsInRange ?? 0)}
            icon={TrendingUp}
            color="text-blue-400"
            sub={DATE_RANGES.find((r) => r.value === range)?.label}
          />
          <KpiCard
            title="Won Projects"
            value={formatNumber(summary?.wonLeads ?? 0)}
            icon={Trophy}
            color="text-green-400"
            sub={`${summary?.conversionRate ?? 0}% conversion`}
          />
          <KpiCard
            title="Revenue"
            value={formatCurrency(summary?.totalRevenue ?? 0)}
            icon={TrendingUp}
            color="text-green-400"
          />
          <KpiCard
            title="Expected Pipeline"
            value={formatCurrency(summary?.expectedRevenue ?? 0)}
            icon={TrendingUp}
            color="text-blue-400"
          />
          <KpiCard
            title="Lost"
            value={formatNumber(summary?.lostLeads ?? 0)}
            icon={Layers}
            color="text-red-400"
          />
          <KpiCard
            title="Archived"
            value={formatNumber(summary?.archivedLeads ?? 0)}
            icon={Layers}
            color="text-muted-foreground"
          />
          <KpiCard
            title="Emails Sent"
            value={formatNumber(emailData?.sent ?? 0)}
            icon={Mail}
            color="text-purple-400"
          />
        </motion.div>

        {/* Row 1: Daily leads area + Platform pie */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          <ChartCard title="Leads Over Time" className="lg:col-span-2">
            {(charts?.dailyLeads?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={charts!.dailyLeads}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(221 83% 53%)"
                    fill="url(#gradLeads)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">
                No lead data for this period
              </p>
            )}
          </ChartCard>

          {/* Platform distribution */}
          <ChartCard title="Lead Sources">
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
                  {platformData.slice(0, 6).map((p) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: p.color }}
                        />
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
          </ChartCard>
        </motion.div>

        {/* Row 2: Follow-up trend bar + Email performance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {/* Status funnel bar chart */}
          <ChartCard title="Pipeline Funnel">
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ fontSize: 10, fill: "hsl(0 0% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                    tickFormatter={(v: string) =>
                      v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    }
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => [val, "Leads"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {funnelData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[entry.status] ?? "hsl(221 83% 53%)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">No funnel data</p>
            )}
          </ChartCard>

          {/* Email performance */}
          <ChartCard title="Email Performance">
            {emailData ? (
              <div className="space-y-4">
                <EmailPerformanceTable
                  sent={emailData.sent}
                  openRate={emailData.openRate}
                  clickRate={emailData.clickRate}
                  replyRate={emailData.replyRate}
                />
                {/* Visual bar representation */}
                <div className="space-y-3 pt-2">
                  {[
                    { label: "Open Rate",  val: emailData.openRate,  color: "bg-purple-500" },
                    { label: "Click Rate", val: emailData.clickRate, color: "bg-cyan-500" },
                    { label: "Reply Rate", val: emailData.replyRate, color: "bg-green-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium tabular-nums">{item.val.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.min(100, item.val)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No email data</p>
            )}
          </ChartCard>
        </motion.div>

        {/* Row 3: Top performing platforms table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ChartCard title="Top Performing Platforms">
            {platformData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left pb-3 font-medium">Platform</th>
                      <th className="text-right pb-3 font-medium">Leads</th>
                      <th className="text-right pb-3 font-medium">Share</th>
                      <th className="text-left pb-3 pl-6 font-medium">Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {platformData
                      .sort((a, b) => b.value - a.value)
                      .map((p) => {
                        const total = platformData.reduce((s, x) => s + x.value, 0);
                        const pct = total > 0 ? (p.value / total) * 100 : 0;
                        return (
                          <tr key={p.name} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ background: p.color }}
                                />
                                <span className="font-medium">{p.name}</span>
                              </div>
                            </td>
                            <td className="text-right py-3 tabular-nums font-medium">
                              {p.value}
                            </td>
                            <td className="text-right py-3 tabular-nums text-muted-foreground">
                              {pct.toFixed(1)}%
                            </td>
                            <td className="py-3 pl-6">
                              <div className="h-1.5 w-32 bg-muted/30 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${pct}%`,
                                    background: p.color,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No platform data</p>
            )}
          </ChartCard>
        </motion.div>
      </div>
    </>
  );
}
