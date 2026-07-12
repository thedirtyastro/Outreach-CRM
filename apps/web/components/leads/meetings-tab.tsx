"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Video, Phone, Users, MapPin, Link as LinkIcon,
  Trash2, Plus, Loader2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { createMeetingSchema, type CreateMeetingInput } from "@outreach/shared";
import { cn } from "@/lib/utils";
import type { IMeeting } from "@outreach/shared";

const MEETING_TYPE_ICON: Record<string, React.ElementType> = {
  call: Phone,
  video: Video,
  in_person: Users,
  other: Calendar,
};

const MEETING_TYPE_COLOR: Record<string, string> = {
  call: "text-blue-400 bg-blue-400/10",
  video: "text-purple-400 bg-purple-400/10",
  in_person: "text-green-400 bg-green-400/10",
  other: "text-gray-400 bg-gray-400/10",
};

interface MeetingsTabProps {
  leadId: string;
}

function AddMeetingDialog({
  open,
  onOpenChange,
  leadId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  leadId: string;
  onSuccess: (m: IMeeting) => void;
}) {
  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMeetingInput>({
    resolver: zodResolver(createMeetingSchema) as never,
    defaultValues: { leadId, type: "video" },
  });

  const type = watch("type");

  async function onSubmit(data: CreateMeetingInput) {
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const meeting = await res.json();
      toast.success("Meeting scheduled");
      reset();
      onOpenChange(false);
      onSuccess(meeting);
    } catch {
      toast.error("Failed to schedule meeting");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input placeholder="Discovery call" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setValue("type", v as CreateMeetingInput["type"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Start Time *</Label>
              <Input type="datetime-local" {...register("startTime")} />
              {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>End Time</Label>
            <Input type="datetime-local" {...register("endTime")} />
          </div>

          {(type === "video" || type === "call") && (
            <div className="space-y-1.5">
              <Label>Meeting URL</Label>
              <Input placeholder="https://meet.google.com/..." {...register("meetingUrl")} />
              {errors.meetingUrl && <p className="text-xs text-destructive">{errors.meetingUrl.message}</p>}
            </div>
          )}

          {type === "in_person" && (
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input placeholder="123 Main St, City" {...register("location")} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="Agenda or notes…" {...register("description")} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MeetingsTab({ leadId }: MeetingsTabProps) {
  const [meetings, setMeetings] = useState<IMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/meetings?leadId=${leadId}`);
      const json = await res.json();
      setMeetings(Array.isArray(json) ? json : []);
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      toast.success("Meeting deleted");
    } catch {
      toast.error("Failed to delete meeting");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-10">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No meetings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting, i) => {
            const Icon = MEETING_TYPE_ICON[meeting.type] ?? Calendar;
            const colorClass = MEETING_TYPE_COLOR[meeting.type] ?? MEETING_TYPE_COLOR.other;
            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-medium truncate">{meeting.title}</h4>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                        aria-label="Delete meeting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(meeting.startTime), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      {meeting.endTime && (
                        <span className="text-xs text-muted-foreground">
                          → {format(new Date(meeting.endTime), "h:mm a")}
                        </span>
                      )}
                    </div>

                    {meeting.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {meeting.description}
                      </p>
                    )}

                    {meeting.meetingUrl && (
                      <a
                        href={meeting.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Join meeting
                      </a>
                    )}

                    {meeting.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3 h-3" />
                        {meeting.location}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AddMeetingDialog
        open={showForm}
        onOpenChange={setShowForm}
        leadId={leadId}
        onSuccess={(m) => setMeetings((prev) => [m, ...prev])}
      />
    </div>
  );
}
