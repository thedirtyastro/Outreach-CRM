"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MoreHorizontal, Trash2, Archive, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useLeadsStore } from "@/store/leads.store";
import { buildQueryString, formatCurrency } from "@/lib/utils";
import { StatusBadge, PriorityBadge, PlatformBadge } from "./lead-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ILead } from "@outreach/shared";
import { getInitials } from "@/lib/utils";

function RowSkeleton() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 bg-muted/50 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function LeadsTable() {
  const router = useRouter();
  const { leads, isLoading, filters, sort, page, total, totalPages, setLeads, setLoading, setPage, removeLead, updateLead } =
    useLeadsStore();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildQueryString({
        page,
        limit: 20,
        sortField: sort.field,
        sortDir: sort.direction,
        search: filters.search || undefined,
        isArchived: filters.isArchived,
        ...(filters.status?.length ? Object.fromEntries(filters.status.map((s, i) => [`status`, s])) : {}),
      });

      // Build proper multi-value params
      const urlParams = new URLSearchParams();
      urlParams.set("page", String(page));
      urlParams.set("limit", "20");
      urlParams.set("sortField", sort.field);
      urlParams.set("sortDir", sort.direction);
      if (filters.search) urlParams.set("search", filters.search);
      urlParams.set("isArchived", String(!!filters.isArchived));
      filters.status?.forEach((s) => urlParams.append("status", s));
      filters.platform?.forEach((p) => urlParams.append("platform", p));
      filters.priority?.forEach((p) => urlParams.append("priority", p));
      filters.tags?.forEach((t) => urlParams.append("tags", t));

      const res = await fetch(`/api/leads?${urlParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLeads(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, sort, filters, setLeads, setLoading]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        removeLead(id);
        toast.success("Lead deleted");
      }
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  async function handleArchive(id: string) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      if (res.ok) {
        removeLead(id);
        toast.success("Lead archived");
      }
    } catch {
      toast.error("Failed to archive lead");
    }
  }

  const columns: ColumnDef<ILead>[] = [
    {
      id: "name",
      header: "Lead",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{lead.name}</p>
              {lead.company && (
                <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "platform",
      header: "Platform",
      cell: ({ row }) => <PlatformBadge platform={row.original.platform} />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "priority",
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[160px] block">
          {row.original.email ?? "—"}
        </span>
      ),
    },
    {
      id: "budget",
      header: "Budget",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original.budget ? formatCurrency(row.original.budget) : "—"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Added",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => router.push(`/dashboard/leads/${lead._id}`)}
              >
                <ExternalLink className="w-4 h-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onClick={() => handleArchive(lead._id)}
              >
                <Archive className="w-4 h-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => handleDelete(lead._id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/20">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
            ) : leads.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No leads found. Add your first lead to get started.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("[data-radix-popper-content-wrapper]")) return;
                    if (target.closest("button")) return;
                    router.push(`/dashboard/leads/${row.original._id}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            {total} lead{total !== 1 ? "s" : ""} total
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
