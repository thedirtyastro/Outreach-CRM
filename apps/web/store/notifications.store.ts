import { create } from "zustand";
import type { INotification } from "@outreach/shared";

interface NotificationsState {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  /** Last fetch timestamp — used to throttle polling */
  lastFetchedAt: number | null;

  // Actions
  setNotifications: (notifications: INotification[], unreadCount: number) => void;
  setLoading: (loading: boolean) => void;
  markRead: (ids: string[]) => void;
  markAllRead: () => void;
  addNotification: (notification: INotification) => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  lastFetchedAt: null,

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount, isLoading: false, lastFetchedAt: Date.now() }),

  setLoading: (isLoading) => set({ isLoading }),

  markRead: (ids) => {
    const idSet = new Set(ids);
    const prev = get();
    const readCount = prev.notifications.filter(
      (n) => idSet.has(n.id) && !n.isRead
    ).length;
    set({
      notifications: prev.notifications.map((n) =>
        idSet.has(n.id) ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, prev.unreadCount - readCount),
    });
  },

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),

  reset: () =>
    set({ notifications: [], unreadCount: 0, isLoading: true, lastFetchedAt: null }),
}));
