"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
import { StatusBadge, PlatformBadge, PriorityBadge } from "./lead-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials, formatCurrency, cn, getStatusColor } from "@/lib/utils";
import type { ILead, LeadStatus } from "@outreach/shared";

// ─── Column config ──────────────────────────────────────────────────────────

export const KANBAN_COLUMNS: { key: LeadStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "initiated", label: "Initiated" },
  { key: "message_sent", label: "Message Sent" },
  { key: "viewed", label: "Viewed" },
  { key: "responded", label: "Responded" },
  { key: "interested", label: "Interested" },
  { key: "meeting_scheduled", label: "Meeting" },
  { key: "proposal_sent", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "ghosted", label: "Ghosted" },
];

// ─── Card ────────────────────────────────────────────────────────────────────

interface KanbanCardProps {
  lead: ILead;
  isDragging?: boolean;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
}

function KanbanCard({ lead, isDragging, onStatusChange, onDelete }: KanbanCardProps) {
  const router = useRouter();
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: sortableDragging,
  } = useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing",
        "hover:border-primary/30 hover:shadow-sm transition-all",
        isDragging && "shadow-xl ring-2 ring-primary/20"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(lead.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => router.push(`/dashboard/leads/${lead._id}`)}
              className="text-sm font-medium truncate block hover:text-primary transition-colors text-left"
            >
              {lead.name}
            </button>
            {lead.company && (
              <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 shrink-0 text-muted-foreground"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => router.push(`/dashboard/leads/${lead._id}`)}
            >
              View details
            </DropdownMenuItem>
            {KANBAN_COLUMNS.filter((c) => c.key !== lead.status).slice(0, 5).map((col) => (
              <DropdownMenuItem
                key={col.key}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onStatusChange(lead._id, col.key)}
              >
                Move to {col.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDelete(lead._id)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        <PlatformBadge platform={lead.platform} />
        <PriorityBadge priority={lead.priority} />
      </div>

      {/* Budget */}
      {lead.budget != null && (
        <p className="text-xs text-muted-foreground tabular-nums">
          Budget: <span className="text-foreground font-medium">{formatCurrency(lead.budget)}</span>
        </p>
      )}
    </div>
  );
}

// ─── Column ──────────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  columnKey: LeadStatus;
  label: string;
  leads: ILead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
  onAddLead?: () => void;
}

function KanbanColumn({
  columnKey, label, leads, onStatusChange, onDelete, onAddLead,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });

  const totalBudget = leads.reduce((sum, l) => sum + (l.budget ?? 0), 0);

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex px-2 py-0.5 rounded-md text-xs font-medium",
            getStatusColor(columnKey)
          )}>
            {label}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {leads.length}
          </span>
        </div>
        {totalBudget > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(totalBudget)}
          </span>
        )}
      </div>

      {/* Cards drop area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-2 space-y-2 min-h-[120px] transition-colors",
          isOver ? "bg-primary/5 ring-1 ring-primary/20" : "bg-muted/10"
        )}
      >
        <SortableContext
          items={leads.map((l) => l._id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <KanbanCard
              key={lead._id}
              lead={lead}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/40">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  leads: ILead[];
  onLeadsUpdate: (leads: ILead[]) => void;
  onAddLead: () => void;
}

export function KanbanBoard({ leads, onLeadsUpdate, onAddLead }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Group leads by status
  const grouped = KANBAN_COLUMNS.reduce<Record<string, ILead[]>>((acc, col) => {
    acc[col.key] = leads.filter((l) => l.status === col.key);
    return acc;
  }, {});

  const activeLead = activeId ? leads.find((l) => l._id === activeId) ?? null : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const leadId = String(active.id);
    // over.id can be a column key or another card's id
    let newStatus: LeadStatus | null = null;

    // Check if dropped directly on a column
    if (KANBAN_COLUMNS.some((c) => c.key === over.id)) {
      newStatus = over.id as LeadStatus;
    } else {
      // Dropped on a card — find that card's column
      const targetLead = leads.find((l) => l._id === over.id);
      if (targetLead && targetLead._id !== leadId) {
        newStatus = targetLead.status;
      }
    }

    const currentLead = leads.find((l) => l._id === leadId);
    if (!newStatus || !currentLead || currentLead.status === newStatus) return;

    // Optimistic update
    const updated = leads.map((l) =>
      l._id === leadId ? { ...l, status: newStatus! } : l
    );
    onLeadsUpdate(updated);

    // Persist
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert
      onLeadsUpdate(leads);
      toast.error("Failed to update status");
    }
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
    const updated = leads.map((l) => (l._id === id ? { ...l, status } : l));
    onLeadsUpdate(updated);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
    } catch {
      onLeadsUpdate(leads);
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        onLeadsUpdate(leads.filter((l) => l._id !== id));
        toast.success("Lead deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 pb-4 overflow-x-auto">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            columnKey={col.key}
            label={col.label}
            leads={grouped[col.key] ?? []}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onAddLead={onAddLead}
          />
        ))}
      </div>

      {/* Drag overlay — ghost card */}
      <DragOverlay>
        {activeLead && (
          <KanbanCard
            lead={activeLead}
            isDragging
            onStatusChange={() => {}}
            onDelete={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
