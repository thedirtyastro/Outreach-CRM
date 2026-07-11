/**
 * lib/api/settings.ts
 *
 * Frontend API client for the settings endpoint.
 */

import { apiClient } from "./client";
import type { ISettings } from "@outreach/shared";

export const settingsApi = {
  get: () =>
    apiClient.get<ISettings>("/api/settings"),

  update: (data: Partial<ISettings>) =>
    apiClient.patch<ISettings>("/api/settings", data),

  regenerateApiKey: () =>
    apiClient.post<{ apiKey: string }>("/api/settings", { action: "regenerate_api_key" }),
};
