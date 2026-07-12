"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Target,
  Mail,
  Trophy,
  CalendarCheck,
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalLeads: number;
  totalEmails: number;
  dealsWon: number;
  totalFollowUps: number;
  totalMeetings: number;
  totalTemplates: number;
  signupsByDay: Record<string, number>;
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Failed to load admin statistics.
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400 bg-blue-400/10" },
    { label: "New Users Today", value: stats.newUsersToday, icon: UserPlus, color: "text-green-400 bg-green-400/10" },
    { label: "New This Week", value: stats.newUsersWeek, icon: UserPlus, color: "text-emerald-400 bg-emerald-400/10" },
    { label: "New This Month", value: stats.newUsersMonth, icon: UserPlus, color: "text-teal-400 bg-teal-400/10" },
    { label: "Total Leads", value: stats.totalLeads, icon: Target, color: "text-purple-400 bg-purple-400/10" },
    { label: "Emails Sent", value: stats.totalEmails, icon: Mail, color: "text-indigo-400 bg-indigo-400/10" },
    { label: "Deals Won", value: stats.dealsWon, icon: Trophy, color: "text-yellow-400 bg-yellow-400/10" },
    { label: "Follow-ups", value: stats.totalFollowUps, icon: CalendarCheck, color: "text-orange-400 bg-orange-400/10" },
    { label: "Meetings", value: stats.totalMeetings, icon: Calendar, color: "text-pink-400 bg-pink-400/10" },
    { label: "Templates", value: stats.totalTemplates, icon: FileText, color: "text-cyan-400 bg-cyan-400/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Signups Chart (simple bar visualization) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">User Signups (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <SignupChart data={stats.signupsByDay} />
        </CardContent>
      </Card>
    </div>
  );
}

function SignupChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No signups in the last 30 days.</p>;
  }

  return (
    <div className="flex items-end gap-1 h-32">
      {entries.map(([day, count]) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-primary/80 rounded-t transition-all group-hover:bg-primary"
            style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? "4px" : "0" }}
          />
          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-popover border border-border rounded text-xs whitespace-nowrap z-10">
            {day}: {count} user{count !== 1 ? "s" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
