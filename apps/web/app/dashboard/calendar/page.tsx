"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, isToday, addMonths, subMonths, addWeeks, subWeeks,
  getDay, startOfDay, endOfDay,
} from "date-fns";
import {
  ChevronLeft, ChevronRight, Plus, LayoutList, CalendarDays, CalendarRange,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AgendaView, type CalendarEvent } from "@/components/calendar/agenda-view";
import { CreateEventDialog } from "@/components/calendar/create-event-dialog";
import { cn } from "@/lib/utils";
import type { IFollowUp, IMeeting } from "@outreach/shared";

type CalendarViewMode = "month" | "week" | "agenda";

const TYPE_COLORS = {
  followup: "bg-blue-500/80",
  meeting: "bg-green-500/80",
};

interface PopulatedMeeting extends Omit<IMeeting, "leadId"> {
  leadId: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    profileImage?: string;
  } | string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fuRes, mtgRes] = await Promise.all([
        fetch("/api/followups?limit=200"),
        fetch("/api/meetings?limit=200"),
      ]);
      const fuJson = await fuRes.json() as { success: boolean; data?: { data?: IFollowUp[] } };
      const mtgJson = await mtgRes.json() as PopulatedMeeting[];

      const evts: CalendarEvent[] = [];

      if (fuJson.success) {
        for (const f of fuJson.data?.data ?? []) {
          evts.push({
            id: f.id,
            title: f.title,
            date: new Date(f.dueDate),
            type: "followup",
            color: TYPE_COLORS.followup,
            description: f.description,
          });
        }
      }

      // /api/meetings returns array directly (not paginated wrapper)
      const meetings = Array.isArray(mtgJson) ? mtgJson : [];
      for (const m of meetings) {
        const lead = typeof m.leadId === "object" && m.leadId !== null ? m.leadId : null;
        evts.push({
          id: m.id,
          title: m.title,
          date: new Date(m.startTime),
          type: "meeting",
          color: TYPE_COLORS.meeting,
          description: m.description ?? m.notes,
          location: m.location,
          meetingUrl: m.meetingUrl,
          meetingType: m.type,
          leadName: lead?.name,
          leadCompany: lead?.company,
        });
      }

      setEvents(evts);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Month grid ──────────────────────────────────────────────────────────────

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);
  const paddedMonthDays: (Date | null)[] = [
    ...Array.from({ length: startPadding }, () => null),
    ...monthDays,
  ];

  // ── Week grid ───────────────────────────────────────────────────────────────

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(e.date, day));
  }

  function navigate(direction: 1 | -1) {
    if (viewMode === "month") {
      setCurrentDate((d) => direction === 1 ? addMonths(d, 1) : subMonths(d, 1));
    } else if (viewMode === "week") {
      setCurrentDate((d) => direction === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    }
  }

  function handleDayClick(day: Date) {
    setSelectedDay(day);
  }

  function handleDayDoubleClick(day: Date) {
    setCreateDate(day);
    setShowCreate(true);
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Header description
  function headerDescription() {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") return `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
    return "Upcoming events";
  }

  return (
    <>
      <Header
        title="Calendar"
        description={headerDescription()}
        actions={
          <Button
            size="sm"
            onClick={() => { setCreateDate(new Date()); setShowCreate(true); }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        }
      />

      <div className="flex-1 p-4 sm:p-6 space-y-5 max-w-6xl">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {viewMode !== "agenda" && (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            <h2 className="text-base font-semibold ml-1">{headerDescription()}</h2>
          </div>

          {/* View mode switcher */}
          <div className="flex gap-1 p-1 bg-muted/40 rounded-lg">
            {([
              { mode: "month" as const, icon: CalendarDays, label: "Month" },
              { mode: "week" as const, icon: CalendarRange, label: "Week" },
              { mode: "agenda" as const, icon: LayoutList, label: "Agenda" },
            ] as const).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Agenda View ─────────────────────────────────────────────────── */}
        {viewMode === "agenda" && (
          <div className="bg-card border border-border rounded-xl p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <AgendaView events={events} />
            )}
          </div>
        )}

        {/* ── Month / Week View ────────────────────────────────────────────── */}
        {(viewMode === "month" || viewMode === "week") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Calendar grid */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {dayNames.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>

              {/* Month grid */}
              {viewMode === "month" && (
                <div className="grid grid-cols-7">
                  {paddedMonthDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`pad-${idx}`} className="min-h-[80px] border-b border-r border-border/50" />;
                    }
                    const dayEvents = getEventsForDay(day);
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                    const todayDay = isToday(day);
                    const inMonth = isSameMonth(day, currentDate);

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        onDoubleClick={() => handleDayDoubleClick(day)}
                        title="Click to view events, double-click to add"
                        className={cn(
                          "min-h-[80px] p-1.5 border-b border-r border-border/50 cursor-pointer transition-colors select-none",
                          !inMonth && "opacity-30",
                          isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                          "hover:bg-muted/20"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1",
                          todayDay && "bg-primary text-primary-foreground font-semibold",
                          !todayDay && "text-foreground"
                        )}>
                          {format(day, "d")}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className={cn("text-xs px-1.5 py-0.5 rounded text-white truncate", e.color)}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground px-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Week grid — time-blocked */}
              {viewMode === "week" && (
                <div className="grid grid-cols-7 divide-x divide-border/50">
                  {weekDays.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                    const todayDay = isToday(day);

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        onDoubleClick={() => handleDayDoubleClick(day)}
                        className={cn(
                          "min-h-[260px] p-2 cursor-pointer transition-colors select-none",
                          isSelected && "bg-primary/5",
                          "hover:bg-muted/20"
                        )}
                      >
                        {/* Day number */}
                        <div className="flex flex-col items-center mb-2">
                          <span className="text-xs text-muted-foreground">
                            {format(day, "EEE")}
                          </span>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-0.5",
                            todayDay && "bg-primary text-primary-foreground",
                          )}>
                            {format(day, "d")}
                          </div>
                        </div>

                        {/* Events */}
                        <div className="space-y-1">
                          {dayEvents.map((e) => (
                            <motion.div
                              key={e.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={cn("text-xs px-1.5 py-1 rounded-md text-white", e.color)}
                            >
                              <p className="font-medium truncate">{e.title}</p>
                              <p className="opacity-80">{format(e.date, "h:mm a")}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Legend */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-sm">Follow-ups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-sm">Meetings</span>
                  </div>
                </div>
              </div>

              {/* Selected day events */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {selectedDay ? format(selectedDay, "MMMM d") : "Select a day"}
                  </h3>
                  {selectedDay && (
                    <button
                      type="button"
                      onClick={() => { setCreateDate(selectedDay); setShowCreate(true); }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
                {selectedDay && selectedDayEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground">No events — double-click to add</p>
                )}
                <div className="space-y-2">
                  {selectedDayEvents.map((e) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30"
                    >
                      <div className={cn("w-2 h-2 rounded-full shrink-0", e.color)} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{format(e.date, "h:mm a")}</p>
                        {e.leadName && (
                          <p className="text-xs text-muted-foreground truncate">{e.leadName}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Upcoming */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Upcoming ({events.filter((e) => e.date >= new Date()).length})
                </h3>
                <div className="space-y-2">
                  {events
                    .filter((e) => e.date >= new Date())
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 5)
                    .map((e) => (
                      <div key={e.id} className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", e.color)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{format(e.date, "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateEventDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        selectedDate={createDate}
        onSuccess={load}
      />
    </>
  );
}
