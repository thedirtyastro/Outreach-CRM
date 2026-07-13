"use client";

import { TrendingUp } from "lucide-react";
import type { ForecastData } from "@outreach/shared";

interface ForecastPanelProps {
  forecast: ForecastData;
}

const CONFIDENCE_COLORS = {
  low: "text-red-400 bg-red-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  high: "text-green-400 bg-green-400/10",
};

export function ForecastPanel({ forecast }: ForecastPanelProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Monthly Forecast</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CONFIDENCE_COLORS[forecast.confidence]}`}>
          {forecast.confidence}
        </span>
      </div>

      <div className="space-y-3">
        <ForecastRow label="Projected Clients" value={forecast.projectedMonthlyClients.toString()} />
        <ForecastRow label="Projected Revenue" value={`₹${forecast.projectedMonthlyRevenue.toLocaleString()}`} />
        <ForecastRow label="Conversion Rate" value={`${forecast.currentConversionRate}%`} />
        <ForecastRow label="Required Daily Outreach" value={forecast.requiredDailyOutreach.toString()} />
        <ForecastRow label="Based on" value={`${forecast.historicalBasis} days of data`} />
      </div>
    </div>
  );
}

function ForecastRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
