"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Mail,
  Trophy,
  Calendar,
  CalendarCheck,
  FileText,
  StickyNote,
  Paperclip,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatDate, formatRelative } from "@/lib/utils";

interface UserDetailData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  };
  stats: {
    totalLeads: number;
    activeLeads: number;
    wonDeals: number;
    winRate: number;
    emailsSent: number;
    meetings: number;
    followUps: number;
    notes: number;
    templates: number;
    attachments: number;
  };
  recentActivities: {
    id: string;
    type: string;
    description: string;
    created_at: string;
  }[];
  settings: {
    theme: string;
    timezone: string;
  } | null;
}

export function AdminUserDetail({ userId }: { userId: string }) {
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-card rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-12">
        User not found or failed to load.
      </div>
    );
  }

  const { user, stats, recentActivities, settings } = data;

  const statCards = [
    { label: "Total Leads", value: stats.totalLeads, icon: Target, color: "text-purple-400 bg-purple-400/10" },
    { label: "Active Leads", value: stats.activeLeads, icon: Target, color: "text-blue-400 bg-blue-400/10" },
    { label: "Deals Won", value: stats.wonDeals, icon: Trophy, color: "text-yellow-400 bg-yellow-400/10" },
    { label: "Win Rate", value: `${stats.winRate}%`, icon: Trophy, color: "text-green-400 bg-green-400/10" },
    { label: "Emails Sent", value: stats.emailsSent, icon: Mail, color: "text-indigo-400 bg-indigo-400/10" },
    { label: "Meetings", value: stats.meetings, icon: Calendar, color: "text-pink-400 bg-pink-400/10" },
    { label: "Follow-ups", value: stats.followUps, icon: CalendarCheck, color: "text-orange-400 bg-orange-400/10" },
    { label: "Notes", value: stats.notes, icon: StickyNote, color: "text-cyan-400 bg-cyan-400/10" },
    { label: "Templates", value: stats.templates, icon: FileText, color: "text-teal-400 bg-teal-400/10" },
    { label: "Attachments", value: stats.attachments, icon: Paperclip, color: "text-gray-400 bg-gray-400/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/admin/users">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
      </Link>

      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={user.email_verified ? "default" : "secondary"} className="gap-1">
                  {user.email_verified ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {user.email_verified ? "Verified" : "Unverified"}
                </Badge>
                {settings && (
                  <span className="text-xs text-muted-foreground">
                    Timezone: {settings.timezone} • Theme: {settings.theme}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Joined {formatDate(user.created_at)}</p>
              <p>Updated {formatRelative(user.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-lg font-bold">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p>{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelative(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
