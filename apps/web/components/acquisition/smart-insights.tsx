"use client";

import { Lightbulb, AlertTriangle, Trophy, Sparkles } from "lucide-react";
import type { Insight } from "@outreach/shared";

interface SmartInsightsProps {
  insights: Insight[];
}

const ICON_MAP = {
  tip: Lightbulb,
  warning: AlertTriangle,
  achievement: Trophy,
  suggestion: Sparkles,
};

const COLOR_MAP = {
  tip: "text-blue-400 bg-blue-400/10",
  warning: "text-yellow-400 bg-yellow-400/10",
  achievement: "text-green-400 bg-green-400/10",
  suggestion: "text-purple-400 bg-purple-400/10",
};

export function SmartInsights({ insights }: SmartInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold mb-3">Smart Insights</h3>
        <p className="text-sm text-muted-foreground">
          Keep logging outreach to unlock personalized insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <h3 className="text-sm font-semibold mb-3">Smart Insights</h3>
      <div className="space-y-2 sm:space-y-3">
        {insights.map((insight) => {
          const Icon = ICON_MAP[insight.type];
          const color = COLOR_MAP[insight.type];
          return (
            <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10">
              <div className={`p-2 rounded-lg shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

