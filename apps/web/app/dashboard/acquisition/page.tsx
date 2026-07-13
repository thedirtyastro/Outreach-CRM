"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { AcquisitionDashboard } from "@outreach/shared";
import { ProgressCards } from "@/components/acquisition/progress-cards";
import { GoalModal } from "@/components/acquisition/goal-modal";
import { OutreachEntryForm } from "@/components/acquisition/outreach-entry-form";
import { FunnelChart } from "@/components/acquisition/funnel-chart";
import { HeatmapCalendar } from "@/components/acquisition/heatmap-calendar";
import { GoalProgressRings } from "@/components/acquisition/goal-progress-rings";
import { SmartInsights } from "@/components/acquisition/smart-insights";
import { StreakSystem } from "@/components/acquisition/streak-system";
import { ForecastPanel } from "@/components/acquisition/forecast-panel";
import { ActivityTimeline } from "@/components/acquisition/activity-timeline";
import { Button } from "@/components/ui/button";
import { Target, Plus, RefreshCw } from "lucide-react";
import AcquisitionLoading from "./loading";

export default function AcquisitionPage() {
  const [dashboard, setDashboard] = useState<AcquisitionDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [entryFormOpen, setEntryFormOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/acquisition/dashboard");
      const json = await res.json();
      if (json.success) {
        setDashboard(json.data);
      } else {
        toast.error(json.error ?? "Failed to load dashboard");
      }
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchDashboard(); }, [fetchDashboard]);

  if (isLoading) return <AcquisitionLoading />;

  // No goal configured state
  if (!dashboard || dashboard.todaysProgress.dailyTarget === 0) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Client Acquisition</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchDashboard}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {dashboard && (
          <ProgressCards progress={dashboard.todaysProgress} />
        )}

        <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-xl">
          <Target className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">Set Your Daily Goal</h2>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            Configure your daily outreach targets to start tracking progress.
            We suggest starting with 10 contacts per day.
          </p>
          <Button onClick={() => setGoalModalOpen(true)}>
            <Target className="w-4 h-4 mr-2" /> Set First Goal
          </Button>
        </div>

        <GoalModal
          isOpen={goalModalOpen}
          onClose={() => setGoalModalOpen(false)}
          onSave={() => { setGoalModalOpen(false); fetchDashboard(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Client Acquisition</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboard}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setGoalModalOpen(true)}>
            <Target className="w-4 h-4 mr-1" /> Edit Goal
          </Button>
          <Button size="sm" onClick={() => setEntryFormOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Log Outreach
          </Button>
        </div>
      </div>

      {/* Progress Cards */}
      <ProgressCards progress={dashboard.todaysProgress} />

      {/* Platform Progress + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GoalProgressRings platforms={dashboard.platformProgress} />
        </div>
        <StreakSystem streak={dashboard.streak} />
      </div>

      {/* Funnel + Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FunnelChart stages={dashboard.funnel} />
        </div>
        <ForecastPanel forecast={dashboard.forecast} />
      </div>

      {/* Heatmap */}
      <HeatmapCalendar
        data={dashboard.heatmap}
        streak={dashboard.streak.currentStreak}
      />

      {/* Insights + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SmartInsights insights={dashboard.insights} />
        <ActivityTimeline logs={dashboard.recentLogs} />
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={() => { setGoalModalOpen(false); fetchDashboard(); }}
      />

      {entryFormOpen && (
        <OutreachEntryForm
          onSave={() => { fetchDashboard(); }}
          onClose={() => setEntryFormOpen(false)}
        />
      )}
    </div>
  );
}
