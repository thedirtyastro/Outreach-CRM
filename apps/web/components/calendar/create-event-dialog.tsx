"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Calendar, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LeadPicker } from "@/components/emails/lead-picker";
import { cn } from "@/lib/utils";

type EventType = "followup" | "meeting";

const followupSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Date is required"),
});

const meetingSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["call", "video", "in_person", "other"]),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FollowupValues = z.infer<typeof followupSchema>;
type MeetingValues = z.infer<typeof meetingSchema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDate: Date | null;
  onSuccess: () => void;
}

export function CreateEventDialog({ open, onOpenChange, selectedDate, onSuccess }: Props) {
  const [eventType, setEventType] = useState<EventType>("followup");

  // Date string in local datetime-local format
  const defaultDatetime = selectedDate
    ? format(selectedDate, "yyyy-MM-dd'T'HH:mm").replace("T00:00", "T09:00")
    : "";
  const defaultDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const fuForm = useForm<FollowupValues>({
    resolver: zodResolver(followupSchema) as never,
    defaultValues: { leadId: "", title: "", description: "", dueDate: defaultDate },
  });

  const mtgForm = useForm<MeetingValues>({
    resolver: zodResolver(meetingSchema) as never,
    defaultValues: {
      leadId: "", title: "", description: "", type: "video",
      startTime: defaultDatetime, endTime: "", location: "", meetingUrl: "", notes: "",
    },
  });

  // Reset with new date when dialog opens
  function handleOpenChange(v: boolean) {
    if (v) {
      fuForm.reset({ leadId: "", title: "", description: "", dueDate: defaultDate });
      mtgForm.reset({
        leadId: "", title: "", description: "", type: "video",
        startTime: defaultDatetime, endTime: "", location: "", meetingUrl: "", notes: "",
      });
    }
    onOpenChange(v);
  }

  async function onFollowupSubmit(data: FollowupValues) {
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, dueDate: new Date(data.dueDate).toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to create follow-up");
      }
      toast.success("Follow-up created");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create follow-up");
    }
  }

  async function onMeetingSubmit(data: MeetingValues) {
    try {
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
      };
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to create meeting");
      }
      toast.success("Meeting scheduled");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule meeting");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedDate ? `New event — ${format(selectedDate, "MMMM d")}` : "New Event"}
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-muted/40 rounded-lg mb-2">
          {(["followup", "meeting"] as EventType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setEventType(t)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium transition-all",
                eventType === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "followup" ? (
                <><CalendarCheck className="w-3.5 h-3.5" />Follow-up</>
              ) : (
                <><Calendar className="w-3.5 h-3.5" />Meeting</>
              )}
            </button>
          ))}
        </div>

        {/* Follow-up form */}
        {eventType === "followup" && (
          <form onSubmit={fuForm.handleSubmit(onFollowupSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Lead</Label>
              <LeadPicker
                value={fuForm.watch("leadId")}
                onChange={(id) => fuForm.setValue("leadId", id, { shouldValidate: true })}
              />
              {fuForm.formState.errors.leadId && (
                <p className="text-xs text-destructive">{fuForm.formState.errors.leadId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fu-title">Title</Label>
              <Input id="fu-title" placeholder="e.g. Check in after proposal" {...fuForm.register("title")} />
              {fuForm.formState.errors.title && (
                <p className="text-xs text-destructive">{fuForm.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fu-date">Due Date</Label>
              <Input id="fu-date" type="date" {...fuForm.register("dueDate")} />
              {fuForm.formState.errors.dueDate && (
                <p className="text-xs text-destructive">{fuForm.formState.errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fu-desc">Description (optional)</Label>
              <Textarea id="fu-desc" rows={3} placeholder="Notes..." {...fuForm.register("description")} />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={fuForm.formState.isSubmitting} className="gap-1.5">
                {fuForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Follow-up
              </Button>
            </div>
          </form>
        )}

        {/* Meeting form */}
        {eventType === "meeting" && (
          <form onSubmit={mtgForm.handleSubmit(onMeetingSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Lead</Label>
              <LeadPicker
                value={mtgForm.watch("leadId")}
                onChange={(id) => mtgForm.setValue("leadId", id, { shouldValidate: true })}
              />
              {mtgForm.formState.errors.leadId && (
                <p className="text-xs text-destructive">{mtgForm.formState.errors.leadId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="mtg-title">Title</Label>
                <Input id="mtg-title" placeholder="e.g. Discovery call" {...mtgForm.register("title")} />
                {mtgForm.formState.errors.title && (
                  <p className="text-xs text-destructive">{mtgForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mtg-start">Start Time</Label>
                <Input id="mtg-start" type="datetime-local" {...mtgForm.register("startTime")} />
                {mtgForm.formState.errors.startTime && (
                  <p className="text-xs text-destructive">{mtgForm.formState.errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mtg-end">End Time (optional)</Label>
                <Input id="mtg-end" type="datetime-local" {...mtgForm.register("endTime")} />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label>Meeting Type</Label>
                <Select
                  defaultValue="video"
                  onValueChange={(v) => mtgForm.setValue("type", v as "call" | "video" | "in_person" | "other")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="mtg-url">Meeting URL (optional)</Label>
                <Input id="mtg-url" type="url" placeholder="https://meet.google.com/..." {...mtgForm.register("meetingUrl")} />
                {mtgForm.formState.errors.meetingUrl && (
                  <p className="text-xs text-destructive">{mtgForm.formState.errors.meetingUrl.message}</p>
                )}
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="mtg-location">Location (optional)</Label>
                <Input id="mtg-location" placeholder="e.g. Office, Zoom, etc." {...mtgForm.register("location")} />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="mtg-notes">Notes (optional)</Label>
                <Textarea id="mtg-notes" rows={3} placeholder="Agenda, preparation notes..." {...mtgForm.register("notes")} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={mtgForm.formState.isSubmitting} className="gap-1.5">
                {mtgForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Schedule Meeting
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
