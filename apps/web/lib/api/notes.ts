/**
 * lib/api/notes.ts
 *
 * Frontend API client for note endpoints.
 */

import { apiClient } from "./client";
import type { INote, ApiResponse } from "@outreach/shared";
import type { CreateNoteInput } from "@outreach/shared";

export const notesApi = {
  list: (params?: { leadId?: string }) =>
    apiClient.get<INote[]>("/api/notes", params),

  create: (data: CreateNoteInput) =>
    apiClient.post<INote>("/api/notes", data),

  update: (id: string, data: Partial<{ content: string; isPinned: boolean }>) =>
    apiClient.patch<INote>(`/api/notes/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/notes/${id}`),

  /** Toggle the pinned state of a note. */
  togglePin: (id: string, isPinned: boolean) =>
    apiClient.patch<INote>(`/api/notes/${id}`, { isPinned }),
};
