"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Plus, RefreshCw, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { KanbanBoard, KANBAN_COLUMNS } from "@/components/leads/kanban-board";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadForm } from "@/components/leads/lead-form";
import { Button } from "@/components/ui/button";
import { useLeadsStore } from "@/store/leads.store";
import { formatCurrency, cn, getStatusColor } from "@/lib/utils";
import type { ILead } from "@outreach/shared";

type ViewMode = "kanban" | "table";

export default function PipelinePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [allLeads, setAllLeads] = useState<ILead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { addLead } = useLeadsStore();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all non-archived leads for kanban (up to 500)
      const res = await fetch("/api/leads?limit=500&isArchived=false");
      const json = await res.json();
      if (json.success) {
        setAllLeads(json.data.data ?? []);
      }
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalLeads = allLeads.length;
  const wonLeads = allLeads.filter((l) => l.status === "won").length;
  const activeLeads = allLeads.filter(
    (l) => !["won", "lost", "ghosted", "rejected"].includes(l.status)
  ).length;
  const pipeline = allLeads
    .filter((l) => !["won", "lost", "ghosted", "rejected"].includes(l.status))
    .reduce((sum, l) => sum + (l.expectedRevenue ?? l.budget ?? 0), 0);

  const conversionRate = totalLeads > 0
    ? Math.round((wonLeads / totalLeads) * 100)
    : 0;

  function handleLeadCreated(lead: ILead) {
    setAllLeads((prev) => [lead, ...prev]);
    addLead(lead);
  }

  return (
    <>
      <Header
        title="Pipeline"
        description={`${totalLeads} leads`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={load}
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {/* View toggle */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors",
                  viewMode === "kanban"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors",
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Total Leads", value: totalLeads, suffix: "" },
            { label: "Active", value: activeLeads, suffix: "" },
            { label: "Won", value: wonLeads, suffix: "" },
            { label: "Pipeline Value", value: formatCurrency(pipeline), suffix: "", isCurrency: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl px-4 py-3"
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xl font-semibold tabular-nums">
                {stat.isCurrency ? stat.value : stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Column summary strip (kanban only) */}
        {viewMode === "kanban" && (
          <div className="flex gap-2 flex-wrap">
            {KANBAN_COLUMNS.map((col) => {
              const count = allLeads.filter((l) => l.status === col.key).length;
              return (
                <div
                  key={col.key}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/30 text-xs"
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    getStatusColor(col.key).split(" ")[0].replace("text-", "bg-")
                  )} />
                  <span className="text-muted-foreground">{col.label}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Board / Table */}
        {isLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-72 h-64 bg-muted/20 rounded-xl animate-pulse shrink-0"
              />
            ))}
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            leads={allLeads}
            onLeadsUpdate={setAllLeads}
            onAddLead={() => setShowForm(true)}
          />
        ) : (
          <LeadsTable />
        )}
      </div>

      <LeadForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleLeadCreated}
      />
    </>
  );
}
