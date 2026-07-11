/**
 * lib/api/followups.ts
 *
 * Frontend API client for follow-up endpoints.
 */

import { apiClient } from "./client";
import type { IFollowUp, ApiResponse, PaginatedResponse } from "@outreach/shared";
import type { CreateFollowUpInput } from "@outreach/shared";

export const followUpsApi = {
  list: (params?: { leadId?: string; status?: string[]; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<IFollowUp>>>("/api/followups", params),

  create: (data: CreateFollowUpInput) =>
    apiClient.post<ApiResponse<IFollowUp>>("/api/followups", data),

  update: (id: string, data: Partial<IFollowUp>) =>
    apiClient.patch<ApiResponse<IFollowUp>>(`/api/followups/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/followups/${id}`),

  /** Shortcut to mark a follow-up as completed. */
  complete: (id: string) =>
    apiClient.patch<ApiResponse<IFollowUp>>(`/api/followups/${id}`, {
      status: "completed",
      completedAt: new Date().toISOString(),
    }),
};
