/**
 * lib/api/templates.ts
 *
 * Frontend API client for template endpoints.
 */

import { apiClient } from "./client";
import type { ITemplate, ApiResponse, PaginatedResponse } from "@outreach/shared";
import type { CreateTemplateInput } from "@outreach/shared";

export const templatesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<ITemplate>>>("/api/templates", params),

  create: (data: CreateTemplateInput) =>
    apiClient.post<ApiResponse<ITemplate>>("/api/templates", data),

  update: (id: string, data: Partial<CreateTemplateInput>) =>
    apiClient.patch<ApiResponse<ITemplate>>(`/api/templates/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/templates/${id}`),
};
