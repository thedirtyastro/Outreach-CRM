import type { LeadStatus, LeadPlatform, LeadPriority, LeadResponse } from "./enums";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalLeads: number;
  todayLeads: number;
  followUpsToday: number;
  pendingReplies: number;
  positiveReplies: number;
  negativeReplies: number;
  meetings: number;
  projectsWon: number;
  projectsLost: number;
  revenue: number;
  expectedRevenue: number;
  conversionRate: number;
  avgResponseTime: number;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus[];
  platform?: LeadPlatform[];
  priority?: LeadPriority[];
  response?: LeadResponse[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  isArchived?: boolean;
}

export interface LeadSort {
  field: string;
  direction: "asc" | "desc";
}
