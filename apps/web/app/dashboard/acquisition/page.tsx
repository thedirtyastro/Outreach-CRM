"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { AcquisitionDashboard } from "@outreach/shared";
import {
  ProgressCards,
  GoalModal,
  OutreachEntryForm,
  FunnelChart,
  HeatmapCalendar,
  GoalProgressRings,
  SmartInsights,
  StreakSystem,
  ForecastPanel,
  ActivityTimeline,
} from "@/components/acquisition";
import { Button } from "@/components/ui/button";
import { Target, Plus, RefreshCw, Menu } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar.store";
import AcquisitionLoading from "./loading";

export default function AcquisitionPage() {
  const [dashboard, setDashboard] = useState<AcquisitionDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const { open: openSidebar } = useSidebarStore();

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
      <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={openSidebar}
              className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold">Client Acquisition</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboard}>
            <RefreshCw className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {dashboard && <ProgressCards progress={dashboard.todaysProgress} />}

        <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-card border border-border rounded-xl">
          <Target className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-4" />
          <h2 className="text-base sm:text-lg font-medium mb-2 text-center">Set Your Daily Goal</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 text-center max-w-md">
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
    <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={openSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold">Client Acquisition</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboard}>
            <RefreshCw className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setGoalModalOpen(true)}>
            <Target className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Edit Goal</span>
          </Button>
          <Button size="sm" onClick={() => setEntryFormOpen(true)}>
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Log Outreach</span>
          </Button>
        </div>
      </div>

      {/* Progress Cards */}
      <ProgressCards progress={dashboard.todaysProgress} />

      {/* Platform Progress + Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-1 lg:col-span-2">
          <GoalProgressRings platforms={dashboard.platformProgress} />
        </div>
        <StreakSystem streak={dashboard.streak} />
      </div>

      {/* Funnel + Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-1 lg:col-span-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
