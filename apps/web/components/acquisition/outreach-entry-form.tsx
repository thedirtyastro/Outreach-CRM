"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface OutreachEntryFormProps {
  onSave: () => void;
  onClose: () => void;
}

const PLATFORMS = ["linkedin", "twitter", "github", "instagram", "email", "website"] as const;
const OUTREACH_TYPES = ["connection", "message", "email", "call"] as const;
const STATUSES = ["sent", "viewed", "replied", "interested"] as const;

const EMPTY_FORM = {
  platform: "linkedin" as string,
  contactName: "",
  company: "",
  outreachType: "message" as string,
  status: "sent" as string,
  notes: "",
};

export function OutreachEntryForm({ onSave, onClose }: OutreachEntryFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(saveAndNext: boolean) {
    if (!form.contactName.trim()) {
      toast.error("Contact name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/acquisition/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        onSave();
        if (saveAndNext) {
          setForm(EMPTY_FORM);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 1500);
        } else {
          toast.success("Outreach logged");
          onClose();
        }
      } else {
        toast.error(json.error ?? "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Log Outreach</h2>
          <div className="flex items-center gap-2">
            {showSuccess && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Platform */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Platform</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, platform: p })}
                  className={`px-2.5 py-1 text-xs rounded-md border capitalize transition-colors ${
                    form.platform === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/20 border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Contact Name *</label>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="John Smith"
              className="w-full p-2 bg-muted/20 border border-border rounded-lg text-sm"
            />
          </div>

          {/* Company */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Acme Corp"
              className="w-full p-2 bg-muted/20 border border-border rounded-lg text-sm"
            />
          </div>

          {/* Outreach Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
            <div className="flex gap-1.5">
              {OUTREACH_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, outreachType: t })}
                  className={`px-2.5 py-1 text-xs rounded-md border capitalize transition-colors ${
                    form.outreachType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/20 border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
            <div className="flex gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  className={`px-2.5 py-1 text-xs rounded-md border capitalize transition-colors ${
                    form.status === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/20 border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes..."
              className="w-full p-2 bg-muted/20 border border-border rounded-lg text-sm resize-none h-16"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={saving}>
            Save & Next
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
