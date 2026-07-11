"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Paperclip, ChevronDown, Save } from "lucide-react";
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
import type { ITemplate } from "@outreach/shared";
import type { LeadSearchResult } from "@/hooks/use-lead-search";

const VARIABLES = ["{{name}}", "{{company}}", "{{role}}", "{{website}}", "{{platform}}", "{{date}}"];

const schema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  defaultLeadId?: string;
  defaultLeadLabel?: string;
}

export function ComposeEmailDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultLeadId,
  defaultLeadLabel,
}: Props) {
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [preview, setPreview] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register, handleSubmit, setValue, watch, reset, getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      leadId: defaultLeadId ?? "",
      subject: "",
      body: "",
    },
  });

  const body = watch("body") ?? "";
  const leadId = watch("leadId");

  // Load templates
  useEffect(() => {
    if (!open) return;
    async function loadTemplates() {
      try {
        const res = await fetch("/api/templates?limit=50");
        const json = await res.json() as { success: boolean; data: { data?: ITemplate[] } };
        if (json.success) setTemplates(json.data.data ?? []);
      } catch {
        // silent
      }
    }
    void loadTemplates();
  }, [open]);

  // Reset form when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      reset({ leadId: defaultLeadId ?? "", subject: "", body: "" });
    }
  }, [open, defaultLeadId, reset]);

  // Autosave draft every 30s if body or subject has content
  useEffect(() => {
    if (!open) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      const vals = getValues();
      if (vals.body.trim() || vals.subject.trim()) {
        void saveDraft(vals, true); // silent autosave
      }
    }, 30_000);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, leadId, open]);

  function applyTemplate(templateId: string) {
    const tmpl = templates.find((t) => t._id === templateId);
    if (!tmpl) return;
    setValue("subject", tmpl.subject);
    setValue("body", tmpl.body);
  }

  function insertVariable(v: string) {
    const textarea = document.getElementById("email-body") as HTMLTextAreaElement | null;
    if (!textarea) {
      setValue("body", body + v);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setValue("body", body.slice(0, start) + v + body.slice(end), { shouldValidate: true });
  }

  async function saveDraft(data: FormValues, silent = false) {
    if (!data.leadId || (!data.body.trim() && !data.subject.trim())) return;
    if (!silent) setIsSavingDraft(true);
    try {
      const res = await fetch("/api/emails/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "draft" }),
      });
      if (!silent && res.ok) toast.success("Draft saved");
    } catch {
      if (!silent) toast.error("Failed to save draft");
    } finally {
      if (!silent) setIsSavingDraft(false);
    }
  }

  async function onSubmit(data: FormValues) {
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to send");
      }

      toast.success("Email sent");
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    }
  }

  function handleClose() {
    reset();
    setPreview(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          {/* Template selector */}
          {templates.length > 0 && (
            <div className="space-y-1.5">
              <Label>Use Template (optional)</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Lead picker */}
          <div className="space-y-1.5">
            <Label>To (Lead)</Label>
            <LeadPicker
              value={leadId}
              onChange={(id) => setValue("leadId", id, { shouldValidate: true })}
              initialLabel={defaultLeadLabel}
            />
            {errors.leadId && <p className="text-xs text-destructive">{errors.leadId.message}</p>}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Subject line..." {...register("subject")} />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-body">Body</Label>
              <div className="flex gap-1 flex-wrap justify-end">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="text-xs font-mono text-primary bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 rounded transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {preview ? (
              <div className="min-h-[180px] p-3 rounded-lg border border-border bg-muted/20 text-sm whitespace-pre-wrap">
                {body}
              </div>
            ) : (
              <Textarea
                id="email-body"
                rows={8}
                placeholder="Write your email here..."
                {...register("body")}
              />
            )}

            {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}

            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${preview ? "rotate-180" : ""}`} />
              {preview ? "Edit" : "Preview"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-1">
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" disabled>
              <Paperclip className="w-4 h-4" />
              Attach
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                disabled={isSavingDraft || !leadId}
                onClick={() => {
                  const vals = getValues();
                  void saveDraft(vals);
                }}
              >
                {isSavingDraft ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Draft
              </Button>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
