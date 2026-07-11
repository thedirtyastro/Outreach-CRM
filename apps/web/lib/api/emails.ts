/**
 * lib/api/emails.ts
 *
 * Frontend API client for email-related endpoints.
 */

import { apiClient } from "./client";
import type { IEmail, ApiResponse } from "@outreach/shared";

export interface SendEmailPayload {
  leadId: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: string[];
}

export interface SaveDraftPayload {
  leadId: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: string[];
}

export const emailsApi = {
  /** List emails, optionally filtered. */
  list: (params?: { leadId?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<{ emails: IEmail[]; pagination: unknown }>("/api/emails", params),

  /** Get a single email. */
  get: (id: string) =>
    apiClient.get<IEmail>(`/api/emails/${id}`),

  /** Send an email. */
  send: (data: SendEmailPayload) =>
    apiClient.post<{ email: IEmail; messageId?: string }>("/api/emails", data),

  /** Save a draft. */
  saveDraft: (data: SaveDraftPayload) =>
    apiClient.post<IEmail>("/api/emails/draft", data),

  /** Update an email. */
  update: (id: string, data: Partial<IEmail>) =>
    apiClient.patch<IEmail>(`/api/emails/${id}`, data),

  /** Delete an email. */
  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/emails/${id}`),
};
