import { create } from "zustand";
import type { ILead } from "@outreach/shared";
import type { LeadFilters, LeadSort, PaginatedResponse } from "@outreach/shared";

interface LeadsState {
  leads: ILead[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;
  sort: LeadSort;
  view: "table" | "kanban";
  selectedIds: Set<string>;

  // Actions
  setLeads: (response: PaginatedResponse<ILead>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<LeadFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: LeadSort) => void;
  setPage: (page: number) => void;
  setView: (view: "table" | "kanban") => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  addLead: (lead: ILead) => void;
  updateLead: (id: string, updates: Partial<ILead>) => void;
  removeLead: (id: string) => void;
  removeLeads: (ids: string[]) => void;
}

const DEFAULT_FILTERS: LeadFilters = {
  search: "",
  status: [],
  platform: [],
  priority: [],
  response: [],
  tags: [],
  isArchived: false,
};

const DEFAULT_SORT: LeadSort = { field: "createdAt", direction: "desc" };

export const useLeadsStore = create<LeadsState>((set) => ({
  leads: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
  view: "table",
  selectedIds: new Set(),

  setLeads: (response) =>
    set({
      leads: response.data,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, page: 1 }),

  setSort: (sort) => set({ sort }),

  setPage: (page) => set({ page }),

  setView: (view) => set({ view }),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  addLead: (lead) =>
    set((state) => ({
      leads: [lead, ...state.leads],
      total: state.total + 1,
    })),

  updateLead: (id, updates) =>
    set((state) => ({
      leads: state.leads.map((l) => (l._id === id ? { ...l, ...updates } : l)),
    })),

  removeLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((l) => l._id !== id),
      total: Math.max(0, state.total - 1),
      selectedIds: new Set([...state.selectedIds].filter((s) => s !== id)),
    })),

  removeLeads: (ids) => {
    const idSet = new Set(ids);
    set((state) => ({
      leads: state.leads.filter((l) => !idSet.has(l._id)),
      total: Math.max(0, state.total - ids.length),
      selectedIds: new Set(
        [...state.selectedIds].filter((s) => !idSet.has(s))
      ),
    }));
  },
}));
