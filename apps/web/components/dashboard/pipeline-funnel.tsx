"use client";

import { useEffect, useState } from "react";

interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

const FUNNEL_STATUSES: Array<{ status: string; label: string; color: string }> = [
  { status: "new", label: "New", color: "bg-blue-500" },
  { status: "message_sent", label: "Contacted", color: "bg-indigo-500" },
  { status: "responded", label: "Responded", color: "bg-cyan-500" },
  { status: "interested", label: "Interested", color: "bg-teal-500" },
  { status: "proposal_sent", label: "Proposal", color: "bg-yellow-500" },
  { status: "won", label: "Won", color: "bg-green-500" },
];

export function PipelineFunnel() {
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allStatuses = FUNNEL_STATUSES.map((s) => s.status);
        const params = new URLSearchParams({ limit: "500" });
        for (const s of allStatuses) params.append("status", s);
        const res = await fetch(`/api/leads?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          const leads: Array<{ status: string }> = json.data.data ?? [];
          const counts: Record<string, number> = {};
          for (const s of FUNNEL_STATUSES) counts[s.status] = 0;
          for (const lead of leads) {
            if (lead.status in counts) counts[lead.status]++;
          }

          setStages(
            FUNNEL_STATUSES.map((s) => ({
              label: s.label,
              count: counts[s.status],
              color: s.color,
            }))
          );
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
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted/30 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-2">
      {stages.map((stage) => {
        const pct = Math.max(4, Math.round((stage.count / max) * 100));
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
              {stage.label}
            </span>
            <div className="flex-1 bg-muted/30 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-xs font-medium tabular-nums text-right shrink-0">
              {stage.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
