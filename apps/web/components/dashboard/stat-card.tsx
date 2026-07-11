"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "default" | "blue" | "green" | "red" | "yellow" | "purple";
  format?: "number" | "currency" | "percent" | "text";
  index?: number;
}

const COLOR_MAP = {
  default: "text-muted-foreground bg-muted",
  blue: "text-blue-400 bg-blue-400/10",
  green: "text-green-400 bg-green-400/10",
  red: "text-red-400 bg-red-400/10",
  yellow: "text-yellow-400 bg-yellow-400/10",
  purple: "text-purple-400 bg-purple-400/10",
};

function formatValue(value: number | string, format: StatCardProps["format"]) {
  if (typeof value === "string") return value;
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    case "percent":
      return `${value}%`;
    default:
      return formatNumber(value);
  }
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "default",
  format = "number",
  index = 0,
}: StatCardProps) {
  const colorClass = COLOR_MAP[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="group bg-card border border-border rounded-xl p-4 hover:border-border/80 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatValue(value, format)}
          </p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-muted-foreground font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg shrink-0 ml-3", colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}
