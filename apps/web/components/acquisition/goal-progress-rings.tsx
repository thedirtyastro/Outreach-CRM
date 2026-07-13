"use client";

import type { PlatformProgress } from "@outreach/shared";

interface GoalProgressRingsProps {
  platforms: PlatformProgress[];
}

export function GoalProgressRings({ platforms }: GoalProgressRingsProps) {
  if (platforms.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-center h-40">
        <p className="text-sm text-muted-foreground">Set a goal to see platform progress</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold mb-4">Platform Progress</h3>
      <div className="flex flex-wrap gap-6">
        {platforms.map((p) => (
          <ProgressRing key={p.platform} {...p} />
        ))}
      </div>
    </div>
  );
}

function ProgressRing({ platform, current, target, percent, color }: PlatformProgress) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = Math.min(100, percent);
  const offset = circumference - (fillPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/30" />
          <circle
            cx="40" cy="40" r={radius} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold tabular-nums">{percent}%</span>
        </div>
      </div>
      <span className="text-xs capitalize text-muted-foreground">{platform}</span>
      <span className="text-[10px] tabular-nums text-muted-foreground">{current}/{target}</span>
    </div>
  );
}
