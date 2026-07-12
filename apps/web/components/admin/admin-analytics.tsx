"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Target,
  Mail,
  MailOpen,
  MousePointerClick,
  MailX,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  users: { total: number; active: number; newThisMonth: number };
  leads: { total: number; byPlatform: Record<string, number>; byStatus: Record<string, number> };
  emails: { total: number; sent: number; opened: number; clicked: number; bounced: number };
  deals: { won: number; lost: number; winRate: number; totalRevenue: number };
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Failed to load analytics.</p>;
  }

  return (
    <div className="space-y-8">
      {/* User Analytics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">User Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Total Users" value={data.users.total} color="text-blue-400 bg-blue-400/10" />
          <StatCard icon={Users} label="Active Users" value={data.users.active} color="text-green-400 bg-green-400/10" />
          <StatCard icon={Users} label="New This Month" value={data.users.newThisMonth} color="text-purple-400 bg-purple-400/10" />
        </div>
      </section>

      {/* CRM Analytics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">CRM Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Total Leads" value={data.leads.total} color="text-indigo-400 bg-indigo-400/10" />
          <StatCard icon={Trophy} label="Deals Won" value={data.deals.won} color="text-yellow-400 bg-yellow-400/10" />
          <StatCard icon={TrendingUp} label="Win Rate" value={`${data.deals.winRate}%`} color="text-green-400 bg-green-400/10" />
          <StatCard icon={Target} label="Pipeline Revenue" value={`₹${data.deals.totalRevenue.toLocaleString()}`} color="text-emerald-400 bg-emerald-400/10" />
        </div>

        {/* Leads by platform */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Leads by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(data.leads.byPlatform).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                  <span className="text-sm capitalize">{platform}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Email Analytics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Email Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Mail} label="Total Sent" value={data.emails.sent} color="text-indigo-400 bg-indigo-400/10" />
          <StatCard icon={MailOpen} label="Opened" value={data.emails.opened} color="text-green-400 bg-green-400/10" />
          <StatCard icon={MousePointerClick} label="Clicked" value={data.emails.clicked} color="text-blue-400 bg-blue-400/10" />
          <StatCard icon={MailX} label="Bounced" value={data.emails.bounced} color="text-red-400 bg-red-400/10" />
          <StatCard
            icon={TrendingUp}
            label="Open Rate"
            value={data.emails.sent > 0 ? `${Math.round((data.emails.opened / data.emails.sent) * 100)}%` : "0%"}
            color="text-teal-400 bg-teal-400/10"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
      </CardContent>
    </Card>
  );
}
