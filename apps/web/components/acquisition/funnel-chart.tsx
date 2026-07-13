"use client";

import { motion } from "framer-motion";
import type { FunnelStage } from "@outreach/shared";

interface FunnelChartProps {
  stages: FunnelStage[];
}

export function FunnelChart({ stages }: FunnelChartProps) {
  const maxCount = stages[0]?.count || 1;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold mb-4">Conversion Funnel</h3>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const widthPercent = maxCount > 0 ? Math.max(8, (stage.count / maxCount) * 100) : 8;
          return (
            <div key={stage.name} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">
                {stage.name}
              </span>
              <div className="flex-1 relative">
                <motion.div
                  className="h-7 rounded-md bg-gradient-to-r from-blue-500/80 to-blue-400/60 flex items-center px-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <span className="text-xs font-medium text-white">
                    {stage.count}
                  </span>
                </motion.div>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground w-14 text-right">
                {i === 0 ? "—" : `${stage.conversionRate}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
