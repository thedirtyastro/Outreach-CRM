/**
 * lib/api/meetings.ts
 *
 * Frontend API client for meeting endpoints.
 */

import { apiClient } from "./client";
import type { IMeeting, ApiResponse } from "@outreach/shared";
import type { CreateMeetingInput } from "@outreach/shared";

export const meetingsApi = {
  list: (params?: { leadId?: string; start?: string; end?: string }) =>
    apiClient.get<IMeeting[]>("/api/meetings", params),

  create: (data: CreateMeetingInput) =>
    apiClient.post<IMeeting>("/api/meetings", data),

  update: (id: string, data: Partial<IMeeting>) =>
    apiClient.patch<IMeeting>(`/api/meetings/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/meetings/${id}`),
};
