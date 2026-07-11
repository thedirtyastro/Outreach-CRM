/**
 * lib/api/tags.ts
 *
 * Frontend API client for tag endpoints.
 */

import { apiClient } from "./client";
import type { ITag, ApiResponse } from "@outreach/shared";

export const tagsApi = {
  list: () =>
    apiClient.get<ITag[]>("/api/tags"),

  create: (name: string, color?: string) =>
    apiClient.post<ITag>("/api/tags", { name, color }),

  update: (id: string, data: Partial<{ name: string; color: string }>) =>
    apiClient.patch<ITag>(`/api/tags/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/tags/${id}`),
};
