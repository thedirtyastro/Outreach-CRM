"use client";

import { Bell, Check, CheckCheck, Info, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { INotification } from "@outreach/shared";

const TYPE_ICON: Record<INotification["type"], React.ElementType> = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  error: XCircle,
};

const TYPE_COLOR: Record<INotification["type"], string> = {
  info: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
};

export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  function handleOpen(open: boolean) {
    // When opening the dropdown, do nothing special — user can mark individually or all at once
    void open;
  }

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 text-muted-foreground hover:text-foreground"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none"
              aria-hidden="true"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 overflow-hidden"
        sideOffset={6}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <ScrollArea className="max-h-[380px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Bell className="w-8 h-8 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Info;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) void markRead([n.id]);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 transition-colors hover:bg-muted/40 group",
                      !n.isRead && "bg-primary/3"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-0.5 shrink-0", TYPE_COLOR[n.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm leading-snug",
                            !n.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                          )}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2.5">
            <p className="text-xs text-muted-foreground text-center">
              Showing {notifications.length} recent notifications
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
