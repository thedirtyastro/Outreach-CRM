"use client";

import { Clock } from "lucide-react";
import type { IOutreachLog } from "@outreach/shared";

interface ActivityTimelineProps {
  logs: IOutreachLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Today&apos;s Activity</h3>
        <p className="text-sm text-muted-foreground">No outreach logged today yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold mb-3">Today&apos;s Activity</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((log) => {
          const time = new Date(log.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/10">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 w-14">
                <Clock className="w-3 h-3" />
                {time}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  <span className="capitalize text-muted-foreground">{log.outreachType}</span>
                  {" → "}
                  <span className="font-medium">{log.contactName}</span>
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {log.platform} · {log.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

