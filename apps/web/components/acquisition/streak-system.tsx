"use client";

import { Flame } from "lucide-react";
import type { StreakData } from "@outreach/shared";

interface StreakSystemProps {
  streak: StreakData;
}

export function StreakSystem({ streak }: StreakSystemProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-semibold">Streak</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums">{streak.currentStreak}</p>
          <p className="text-[10px] text-muted-foreground">Current</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums">{streak.longestStreak}</p>
          <p className="text-[10px] text-muted-foreground">Longest</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums">{streak.completedDays}</p>
          <p className="text-[10px] text-muted-foreground">Total Days</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        {streak.badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
              badge.earned
                ? "bg-green-400/10 text-green-400"
                : "bg-muted/20 text-muted-foreground opacity-50"
            }`}
            title={badge.description}
          >
            <span>{badge.icon}</span>
            <span>{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
