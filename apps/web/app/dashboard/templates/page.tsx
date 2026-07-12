"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Copy, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createTemplateSchema, type CreateTemplateInput } from "@outreach/shared";
import type { ITemplate } from "@outreach/shared";

const TEMPLATE_TYPES = [
  { value: "introduction", label: "Introduction" },
  { value: "follow_up", label: "Follow-up" },
  { value: "reminder", label: "Reminder" },
  { value: "proposal", label: "Proposal" },
  { value: "meeting_confirmation", label: "Meeting Confirmation" },
  { value: "thank_you", label: "Thank You" },
  { value: "custom", label: "Custom" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  introduction: "text-blue-400 bg-blue-400/10",
  follow_up: "text-purple-400 bg-purple-400/10",
  reminder: "text-yellow-400 bg-yellow-400/10",
  proposal: "text-green-400 bg-green-400/10",
  meeting_confirmation: "text-teal-400 bg-teal-400/10",
  thank_you: "text-pink-400 bg-pink-400/10",
  custom: "text-gray-400 bg-gray-400/10",
};

const VARIABLES = ["{{name}}", "{{company}}", "{{role}}", "{{website}}", "{{platform}}", "{{date}}"];

function TemplateCard({ template, onDelete }: { template: ITemplate; onDelete: (id: string) => void }) {
  function copyBody() {
    navigator.clipboard.writeText(template.body);
    toast.success("Copied to clipboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-medium text-sm truncate">{template.name}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{template.subject}</p>
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium shrink-0", TYPE_COLORS[template.type] ?? TYPE_COLORS.custom)}>
          {template.type.replace("_", " ")}
        </span>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{template.body}</p>

      {template.variables.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {template.variables.map((v) => (
            <span key={v} className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">{v}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={copyBody}>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive ml-auto"
          onClick={() => onDelete(template.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function CreateTemplateDialog({ open, onOpenChange, onSuccess }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<CreateTemplateInput>({
      resolver: zodResolver(createTemplateSchema) as never,
      defaultValues: { type: "custom", variables: [], isDefault: false },
    });

  const type = watch("type");

  function insertVariable(v: string) {
    const textarea = document.getElementById("body") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const next = current.slice(0, start) + v + current.slice(end);
    setValue("body", next, { shouldValidate: true });
  }

  async function onSubmit(data: CreateTemplateInput) {
    // Extract variables from body
    const vars = Array.from(data.body.matchAll(/\{\{(\w+)\}\}/g)).map((m) => `{{${m[1]}}}`);
    data.variables = [...new Set(vars)];

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Template created");
      reset();
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error("Failed to create template");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Cold outreach intro" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setValue("type", v as CreateTemplateInput["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input placeholder="Quick question about {{company}}" {...register("subject")} />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Body</Label>
              <div className="flex gap-1 flex-wrap">
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
            <Textarea id="body" rows={8} placeholder="Hi {{name}},..." {...register("body")} />
            {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeType, setActiveType] = useState<string>("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/templates?limit=50");
      const json = await res.json();
      if (json.success) setTemplates(json.data.data ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
    }
  }

  const types = ["all", ...new Set(templates.map((t) => t.type))];
  const filtered = activeType === "all" ? templates : templates.filter((t) => t.type === activeType);

  return (
    <>
      <Header
        title="Templates"
        description={`${templates.length} templates`}
        actions={
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        }
      />
      <div className="flex-1 p-6 space-y-5 max-w-[1200px]">
        {/* Type filter */}
        <div className="flex gap-1.5 flex-wrap">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {type === "all" ? "All" : type.replace("_", " ")}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No templates yet</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              Create your first template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TemplateCard key={t.id} template={t} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <CreateTemplateDialog open={showForm} onOpenChange={setShowForm} onSuccess={load} />
    </>
  );
}
