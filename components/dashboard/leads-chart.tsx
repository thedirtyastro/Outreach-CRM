"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { subDays, format } from "date-fns";

interface ChartPoint {
  date: string;
  leads: number;
}

function generateEmptyData(): ChartPoint[] {
  return Array.from({ length: 14 }, (_, i) => ({
    date: format(subDays(new Date(), 13 - i), "MMM d"),
    leads: 0,
  }));
}

export function LeadsChart() {
  const [data, setData] = useState<ChartPoint[]>(generateEmptyData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({
          limit: "200",
          dateFrom: subDays(new Date(), 13).toISOString(),
        });
        const res = await fetch(`/api/leads?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          const leads: Array<{ createdAt: string }> = json.data.data ?? [];
          const counts: Record<string, number> = {};

          for (let i = 0; i < 14; i++) {
            const d = subDays(new Date(), 13 - i);
            counts[format(d, "MMM d")] = 0;
          }

          for (const lead of leads) {
            const key = format(new Date(lead.createdAt), "MMM d");
            if (key in counts) counts[key]++;
          }

          setData(
            Object.entries(counts).map(([date, leadsCount]) => ({
              date,
              leads: leadsCount,
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
    return <div className="h-48 bg-muted/30 rounded-lg animate-pulse" />;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(0 0% 12%)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(0 0% 5.5%)",
            border: "1px solid hsl(0 0% 12%)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          labelStyle={{ color: "hsl(0 0% 98%)" }}
          itemStyle={{ color: "hsl(221 83% 53%)" }}
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="hsl(221 83% 53%)"
          strokeWidth={2}
          fill="url(#leadGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(221 83% 53%)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
