"use client";

import type { DailyActivity } from "@outreach/shared";

interface HeatmapCalendarProps {
  data: DailyActivity[];
  streak: number;
}

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-muted/30";
  if (count <= 2) return "bg-green-900/40";
  if (count <= 5) return "bg-green-700/50";
  if (count <= 9) return "bg-green-500/60";
  return "bg-green-400/80";
}

export function HeatmapCalendar({ data, streak }: HeatmapCalendarProps) {
  // Organize into weeks (columns of 7)
  const weeks: DailyActivity[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const bestDay = data.reduce((best, d) => d.count > best.count ? d : best, data[0]);
  const missedDays = data.filter((d) => !d.goalMet && d.count === 0).length;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Activity Heatmap</h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>🔥 {streak} day streak</span>
          <span>⭐ Best: {bestDay?.count ?? 0} ({bestDay?.date ?? "—"})</span>
          <span>❌ {missedDays} missed</span>
        </div>
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-[2px] ${getIntensityClass(day.count)}`}
                title={`${day.date}: ${day.count} contacts${day.goalMet ? " ✓" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[2px] bg-muted/30" />
        <div className="w-3 h-3 rounded-[2px] bg-green-900/40" />
        <div className="w-3 h-3 rounded-[2px] bg-green-700/50" />
        <div className="w-3 h-3 rounded-[2px] bg-green-500/60" />
        <div className="w-3 h-3 rounded-[2px] bg-green-400/80" />
        <span>More</span>
      </div>
    </div>
  );
}
