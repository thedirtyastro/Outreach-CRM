"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  MailOpen,
  MousePointerClick,
  CalendarPlus,
  Phone,
  StickyNote,
  FileUp,
  Trophy,
  XCircle,
  RefreshCw,
  CalendarCheck,
  Paperclip,
  Pencil,
} from "lucide-react";
import { formatRelative } from "@/lib/utils";
import type { IActivity } from "@outreach/shared";
import type { ActivityType } from "@outreach/shared";

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  lead_created: UserPlus,
  lead_updated: Pencil,
  email_sent: Mail,
  email_opened: MailOpen,
  email_clicked: MousePointerClick,
  meeting_added: CalendarPlus,
  call_logged: Phone,
  note_added: StickyNote,
  proposal_uploaded: FileUp,
  project_won: Trophy,
  project_lost: XCircle,
  status_changed: RefreshCw,
  follow_up_created: CalendarPlus,
  follow_up_completed: CalendarCheck,
  attachment_added: Paperclip,
};

const ACTIVITY_COLORS: Partial<Record<ActivityType, string>> = {
  lead_created: "text-blue-400 bg-blue-400/10",
  project_won: "text-green-400 bg-green-400/10",
  project_lost: "text-red-400 bg-red-400/10",
  email_sent: "text-purple-400 bg-purple-400/10",
  meeting_added: "text-yellow-400 bg-yellow-400/10",
  follow_up_completed: "text-emerald-400 bg-emerald-400/10",
};

interface ActivityFeedProps {
  leadId?: string;
  limit?: number;
}

export function ActivityFeed({ leadId, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (leadId) params.set("leadId", leadId);
        const res = await fetch(`/api/activities?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setActivities(json.data.data ?? []);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [leadId, limit]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No activity yet
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, i) => {
        const Icon = ACTIVITY_ICONS[activity.type] ?? RefreshCw;
        const colorClass =
          ACTIVITY_COLORS[activity.type] ??
          "text-muted-foreground bg-muted";

        return (
          <motion.div
            key={activity._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="flex gap-3 py-2"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelative(activity.createdAt)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
