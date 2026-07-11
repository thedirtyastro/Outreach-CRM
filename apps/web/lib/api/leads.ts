/**
 * lib/api/leads.ts
 *
 * Frontend API client for lead-related endpoints.
 * Import these functions in client components and hooks instead of calling fetch() directly.
 */

import { apiClient } from "./client";
import type { ILead, ApiResponse, PaginatedResponse } from "@outreach/shared";
import type { LeadFilters, LeadSort } from "@outreach/shared";
import type { CreateLeadInput, UpdateLeadInput } from "@outreach/shared";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FetchLeadsParams {
  [key: string]: string | number | boolean | string[] | null | undefined;
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  platform?: string[];
  priority?: string[];
  response?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  isArchived?: boolean;
  sortField?: string;
  sortDir?: "asc" | "desc";
}

// ── API calls ────────────────────────────────────────────────────────────────

export const leadsApi = {
  /** Fetch a paginated, filtered list of leads. */
  list: (params: FetchLeadsParams = {}) =>
    apiClient.get<ApiResponse<PaginatedResponse<ILead>>>("/api/leads", params),

  /** Get a single lead by id. */
  get: (id: string) =>
    apiClient.get<ApiResponse<ILead>>(`/api/leads/${id}`),

  /** Create a new lead. */
  create: (data: CreateLeadInput) =>
    apiClient.post<ApiResponse<ILead>>("/api/leads", data),

  /** Update a lead. */
  update: (id: string, data: UpdateLeadInput) =>
    apiClient.patch<ApiResponse<ILead>>(`/api/leads/${id}`, data),

  /** Delete a lead. */
  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/leads/${id}`),

  /** Bulk delete / archive / restore leads. */
  bulk: (ids: string[], action: "delete" | "archive" | "restore") =>
    apiClient.post<ApiResponse>("/api/leads/bulk", { ids, action }),

  /** Download all leads as a CSV file. Triggers a browser download. */
  exportCsv: async () => {
    const response = await fetch("/api/leads/export");
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Import leads from a CSV string. */
  importCsv: (csvText: string) =>
    fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: csvText,
    }).then((r) => r.json()) as Promise<ApiResponse>,
};
