"use client";

import { motion } from "framer-motion";
import { Users, MessageSquare, Calendar, Trophy, DollarSign, Target, Percent } from "lucide-react";
import type { TodaysProgress } from "@outreach/shared";

interface ProgressCardsProps {
  progress: TodaysProgress;
}

const CARDS = [
  { key: "dailyTarget", label: "Daily Target", icon: Target, color: "text-blue-400 bg-blue-400/10" },
  { key: "contactsReached", label: "Contacted", icon: Users, color: "text-green-400 bg-green-400/10" },
  { key: "repliesReceived", label: "Replies", icon: MessageSquare, color: "text-purple-400 bg-purple-400/10" },
  { key: "meetingsBooked", label: "Meetings", icon: Calendar, color: "text-yellow-400 bg-yellow-400/10" },
  { key: "clientsWon", label: "Clients Won", icon: Trophy, color: "text-emerald-400 bg-emerald-400/10" },
  { key: "revenueGenerated", label: "Revenue", icon: DollarSign, color: "text-green-400 bg-green-400/10", format: "currency" },
  { key: "completionPercent", label: "Completion", icon: Percent, color: "text-blue-400 bg-blue-400/10", format: "percent" },
] as const;

export function ProgressCards({ progress }: ProgressCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {CARDS.map((card, i) => {
        const value = progress[card.key as keyof TodaysProgress];
        const Icon = card.icon;
        const formatted = card.format === "currency"
          ? `₹${value.toLocaleString()}`
          : card.format === "percent"
          ? `${value}%`
          : value;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-semibold tabular-nums">{formatted}</p>
              </div>
              <div className={`p-2 rounded-lg shrink-0 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Progress bar */}
      {progress.dailyTarget > 0 && (
        <div className="col-span-full bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {progress.contactsReached} / {progress.dailyTarget} contacts
            </span>
            <span className="text-sm font-medium">{progress.completionPercent}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress.completionPercent)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
