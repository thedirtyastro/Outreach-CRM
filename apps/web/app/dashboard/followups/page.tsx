"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format, isPast, isToday } from "date-fns";
import { CalendarCheck, Plus, Check, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createFollowUpSchema, type CreateFollowUpInput } from "@outreach/shared";
import type { IFollowUp } from "@outreach/shared";

type FollowUpStatus = "pending" | "completed" | "overdue" | "cancelled";

const STATUS_STYLES: Record<FollowUpStatus, string> = {
  pending: "text-blue-400 bg-blue-400/10",
  completed: "text-green-400 bg-green-400/10",
  overdue: "text-red-400 bg-red-400/10",
  cancelled: "text-gray-400 bg-gray-400/10",
};

function FollowUpCard({
  followUp,
  onComplete,
  onDelete,
}: {
  followUp: IFollowUp;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const due = new Date(followUp.dueDate);
  const isOverdue = isPast(due) && followUp.status === "pending";
  const isDueToday = isToday(due);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card border rounded-xl p-4 flex items-start gap-3 hover:border-border/80 transition-colors",
        isOverdue ? "border-red-500/30" : isDueToday ? "border-yellow-500/30" : "border-border"
      )}
    >
      {/* Complete button */}
      <button
        onClick={() => onComplete(followUp.id)}
        disabled={followUp.status === "completed"}
        className={cn(
          "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          followUp.status === "completed"
            ? "bg-green-500 border-green-500"
            : "border-border hover:border-green-500"
        )}
        aria-label="Mark complete"
      >
        {followUp.status === "completed" && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", followUp.status === "completed" && "line-through text-muted-foreground")}>
          {followUp.title}
        </p>
        {followUp.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{followUp.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium", STATUS_STYLES[followUp.status as FollowUpStatus])}>
            {followUp.status}
          </span>
          <span className={cn("text-xs", isOverdue ? "text-red-400" : isDueToday ? "text-yellow-400" : "text-muted-foreground")}>
            {isDueToday ? "Due today" : isOverdue ? `Overdue · ${format(due, "MMM d")}` : `Due ${format(due, "MMM d, yyyy")}`}
          </span>
          {followUp.isRecurring && (
            <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md">Recurring</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(followUp.id)}
        className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0"
        aria-label="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function AddFollowUpDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFollowUpInput>({
    resolver: zodResolver(createFollowUpSchema) as never,
    defaultValues: { isRecurring: false },
  });

  async function onSubmit(data: CreateFollowUpInput) {
    const res = await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Follow-up scheduled");
      reset();
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error("Failed to create follow-up");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="leadId">Lead ID</Label>
            <Input id="leadId" placeholder="Lead ID (UUID)" {...register("leadId")} />
            {errors.leadId && <p className="text-xs text-destructive">{errors.leadId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Send proposal" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea id="description" rows={2} placeholder="Additional context…" {...register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="datetime-local" {...register("dueDate")} />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<IFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "all">("pending");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (activeTab !== "all") params.set("status", activeTab === "pending" ? "pending" : "completed");
      const res = await fetch(`/api/followups?${params.toString()}`);
      const json = await res.json();
      if (json.success) setFollowUps(json.data.data ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { void load(); }, [load]);

  async function handleComplete(id: string) {
    const res = await fetch(`/api/followups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (res.ok) {
      setFollowUps((prev) => prev.map((f) => f.id === id ? { ...f, status: "completed" as const } : f));
      toast.success("Marked as complete");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/followups/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFollowUps((prev) => prev.filter((f) => f.id !== id));
      toast.success("Follow-up deleted");
    }
  }

  const tabs = [
    { key: "pending" as const, label: "Pending" },
    { key: "completed" as const, label: "Completed" },
    { key: "all" as const, label: "All" },
  ];

  const pendingCount = followUps.filter((f) => f.status === "pending").length;
  const overdueCount = followUps.filter(
    (f) => f.status === "pending" && isPast(new Date(f.dueDate))
  ).length;

  return (
    <>
      <Header
        title="Follow-ups"
        description={`${pendingCount} pending${overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}`}
        actions={
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Schedule
          </Button>
        }
      />

      <div className="flex-1 p-6 max-w-3xl space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : followUps.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No follow-ups yet</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              Schedule one now
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {followUps.map((f) => (
              <FollowUpCard
                key={f.id}
                followUp={f}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AddFollowUpDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={load}
      />
    </>
  );
}
