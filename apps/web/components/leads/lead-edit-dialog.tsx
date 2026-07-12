"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateLeadSchema, type UpdateLeadInput } from "@outreach/shared";
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
import type { ILead } from "@outreach/shared";

interface LeadEditDialogProps {
  lead: ILead;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (updated: ILead) => void;
}

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "github", label: "GitHub" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
] as const;

const STATUSES = [
  { value: "new", label: "New" },
  { value: "initiated", label: "Initiated" },
  { value: "message_sent", label: "Message Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "responded", label: "Responded" },
  { value: "interested", label: "Interested" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "waiting", label: "Waiting" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "ghosted", label: "Ghosted" },
  { value: "rejected", label: "Rejected" },
] as const;

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

const RESPONSES = [
  { value: "none", label: "None" },
  { value: "positive", label: "Positive" },
  { value: "negative", label: "Negative" },
  { value: "neutral", label: "Neutral" },
] as const;

export function LeadEditDialog({ lead, open, onOpenChange, onSuccess }: LeadEditDialogProps) {
  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateLeadInput>({
    resolver: zodResolver(updateLeadSchema) as never,
  });

  // Populate form when lead changes
  useEffect(() => {
    if (lead && open) {
      reset({
        name: lead.name,
        company: lead.company ?? "",
        designation: lead.designation ?? "",
        industry: lead.industry ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        whatsapp: lead.whatsapp ?? "",
        website: lead.website ?? "",
        linkedin: lead.linkedin ?? "",
        twitter: lead.twitter ?? "",
        instagram: lead.instagram ?? "",
        github: lead.github ?? "",
        portfolio: lead.portfolio ?? "",
        location: lead.location ?? "",
        bio: lead.bio ?? "",
        platform: lead.platform,
        status: lead.status,
        priority: lead.priority,
        response: lead.response,
        budget: lead.budget,
        expectedRevenue: lead.expectedRevenue,
        projectType: lead.projectType,
      });
    }
  }, [lead, open, reset]);

  const platform = watch("platform");
  const status = watch("status");
  const priority = watch("priority");
  const response = watch("response");

  async function onSubmit(data: UpdateLeadInput) {
    try {
      // Clean empty strings to undefined
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "" && v !== undefined)
      );
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update");
      toast.success("Lead updated");
      onSuccess(json.data as ILead);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lead");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* Section: Basic */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Basic Info
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full name *</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input {...register("company")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Input {...register("designation")} />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input {...register("industry")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input {...register("location")} />
            </div>
          </fieldset>

          {/* Section: Pipeline */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pipeline
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(v) => setValue("platform", v as UpdateLeadInput["platform"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setValue("status", v as UpdateLeadInput["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setValue("priority", v as UpdateLeadInput["priority"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Response</Label>
                <Select value={response} onValueChange={(v) => setValue("response", v as UpdateLeadInput["response"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESPONSES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          {/* Section: Contact */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contact
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input {...register("phone")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input {...register("whatsapp")} />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input {...register("website")} />
                {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
              </div>
            </div>
          </fieldset>

          {/* Section: Social */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Social
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>LinkedIn</Label>
                <Input {...register("linkedin")} />
                {errors.linkedin && <p className="text-xs text-destructive">{errors.linkedin.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Twitter / X</Label>
                <Input {...register("twitter")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>GitHub</Label>
                <Input {...register("github")} />
              </div>
              <div className="space-y-1.5">
                <Label>Instagram</Label>
                <Input {...register("instagram")} />
              </div>
            </div>
          </fieldset>

          {/* Section: Financials */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Financials
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  min="0"
                  {...register("budget", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Revenue ($)</Label>
                <Input
                  type="number"
                  min="0"
                  {...register("expectedRevenue", { valueAsNumber: true })}
                />
              </div>
            </div>
          </fieldset>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label>Bio / Notes</Label>
            <Textarea rows={3} {...register("bio")} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
