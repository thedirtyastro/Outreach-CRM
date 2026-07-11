"use client";

import { useMemo } from "react";
import { format, isToday, isTomorrow, isThisWeek, differenceInCalendarDays } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Video, Phone, Users, CalendarCheck, MapPin, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "followup" | "meeting";
  color: string;
  description?: string;
  location?: string;
  meetingUrl?: string;
  meetingType?: string;
  leadName?: string;
  leadCompany?: string;
}

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const MEETING_TYPE_ICON: Record<string, React.ElementType> = {
  video: Video,
  call: Phone,
  in_person: Users,
  other: Calendar,
};

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE");
  const days = differenceInCalendarDays(date, new Date());
  if (days < 14) return `In ${days} days`;
  return format(date, "MMMM d, yyyy");
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  // Group upcoming events by date bucket
  const now = new Date();
  const upcoming = useMemo(
    () => events
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events]
  );

  // Group by day string
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of upcoming) {
      const key = format(e.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [upcoming]);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarCheck className="w-10 h-10 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([dateKey, dayEvents]) => {
        const date = new Date(dateKey + "T00:00:00");
        return (
          <div key={dateKey}>
            {/* Date heading */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "flex flex-col items-center justify-center w-12 h-12 rounded-xl border shrink-0",
                isToday(date)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground"
              )}>
                <span className="text-xs font-medium leading-none">{format(date, "MMM")}</span>
                <span className="text-lg font-bold leading-none mt-0.5">{format(date, "d")}</span>
              </div>
              <div>
                <p className={cn("text-sm font-semibold", isToday(date) && "text-primary")}>
                  {getDateLabel(date)}
                </p>
                <p className="text-xs text-muted-foreground">{format(date, "EEEE")}</p>
              </div>
            </div>

            {/* Events */}
            <div className="ml-15 space-y-2 pl-4 border-l border-border/50">
              {dayEvents.map((event, i) => {
                const MeetingIcon = event.meetingType
                  ? (MEETING_TYPE_ICON[event.meetingType] ?? Calendar)
                  : event.type === "followup"
                  ? CalendarCheck
                  : Calendar;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onEventClick?.(event)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border border-border bg-card transition-colors",
                      onEventClick && "cursor-pointer hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      event.type === "followup" ? "bg-blue-500/10" : "bg-green-500/10"
                    )}>
                      <MeetingIcon className={cn(
                        "w-4 h-4",
                        event.type === "followup" ? "text-blue-400" : "text-green-400"
                      )} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {format(event.date, "h:mm a")}
                        </span>
                      </div>

                      {event.leadName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.leadName}{event.leadCompany ? ` · ${event.leadCompany}` : ""}
                        </p>
                      )}

                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {(event.location || event.meetingUrl) && (
                        <div className="flex items-center gap-3 mt-1.5">
                          {event.location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                          {event.meetingUrl && (
                            <a
                              href={event.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Link2 className="w-3 h-3" />
                              Join
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
