"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, addMonths, subMonths, getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Video, Phone, Users } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IFollowUp } from "@/types";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "followup" | "meeting";
  color: string;
};

const TYPE_COLORS = {
  followup: "bg-blue-500/80",
  meeting: "bg-green-500/80",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fuRes] = await Promise.all([
        fetch(`/api/followups?limit=100`),
      ]);
      const fuJson = await fuRes.json();

      const evts: CalendarEvent[] = [];
      if (fuJson.success) {
        for (const f of (fuJson.data.data ?? []) as IFollowUp[]) {
          evts.push({
            id: f._id,
            title: f.title,
            date: new Date(f.dueDate),
            type: "followup",
            color: TYPE_COLORS.followup,
          });
        }
      }
      setEvents(evts);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty cells
  const startPadding = getDay(monthStart);
  const paddedDays: (Date | null)[] = [
    ...Array.from({ length: startPadding }, () => null),
    ...days,
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(e.date, day));
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <>
      <Header title="Calendar" description={format(currentDate, "MMMM yyyy")} />
      <div className="flex-1 p-6 max-w-5xl space-y-5">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Grid */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {dayNames.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {paddedDays.map((day, idx) => {
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
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "min-h-[80px] p-1.5 border-b border-r border-border/50 cursor-pointer transition-colors",
                      !inMonth && "opacity-30",
                      isSelected && "bg-primary/5",
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
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {selectedDay ? format(selectedDay, "MMMM d") : "Select a day"}
              </h3>
              {selectedDay && selectedDayEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">No events</p>
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
                        <p className="text-xs text-muted-foreground">{format(e.date, "MMM d")}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
